// /sim/cfd_solver.js
// CFD v13.1 complete equation system: ①-⑤
import {
    calc_reaction,
    calc_diffusion,
    calc_advection,
    calc_noise,
    calc_G,
    calc_gamma,
    calc_erosion
} from '../core/index.js';

export class CFDSolver {
    constructor(config) {
        this.config = config;
        this.N = config.N;
        this.rho = new Array(this.N).fill(0).map(() => new Array(this.N).fill(0));
        this.F = new Array(this.N).fill(0).map(() => new Array(this.N).fill(0));
        this.G = 0;
        this.gamma = config.gamma_min;

        const dx = config.dx;
        const half = this.N / 2;
        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.N; j++) {
                const x = (j - half + 0.5) * dx;
                const y = (i - half + 0.5) * dx;
                this.F[i][j] = 0.5 * (x * x + y * y);
            }
        }

        // W-kernel for erosion (Mexican-hat approximation)
        this.k_rad = Math.ceil((config.W_sigma || 0.1) * 2 / config.dx);
        this.W_kernel = [];
        const two_sig_sq = 2.0 * (config.W_sigma || 0.1) ** 2;
        const norm = 1.0 / (Math.PI * two_sig_sq);
        for (let dy = -this.k_rad; dy <= this.k_rad; dy++) {
            let row = [];
            for (let dx_i = -this.k_rad; dx_i <= this.k_rad; dx_i++) {
                const dsq = (dx_i * config.dx) ** 2 + (dy * config.dx) ** 2;
                row.push(norm * Math.exp(-dsq / two_sig_sq) * config.dx * config.dx);
            }
            this.W_kernel.push(row);
        }
    }

    step(current_time, current_pi_int) {
        const c = this.config;
        const { N, dx, dt, lambda_0, kappa, D0, noise_sigma,
            B, gamma_min, gamma_max, G_threshold, G_steepness,
            tau_base, erosion_coeff, pi_ext, boundary_flux } = c;

        // v13.1 parameters with defaults
        const r_0 = c.r_0 !== undefined ? c.r_0 : 0.1;       // 中心の残留可塑性 [L]
        const rho_0 = c.rho_0 !== undefined ? c.rho_0 : 1.0;  // 参照情報密度 [L^-2]
        const R_bound = 1.0;                                    // 境界半径
        const pi_0 = c.pi_0 !== undefined ? c.pi_0 : 1.0;     // 参照精度レート [T^-1]
        const k_G = c.k_G !== undefined ? c.k_G : 1.0;        // 変容抵抗スケーリング定数

        this.G = calc_G(this.rho, this.F, N, dx, k_G);
        this.gamma = calc_gamma(this.G, gamma_min, gamma_max, G_steepness, G_threshold);
        const v_coeff = B / this.gamma;

        let next_rho = this.rho.map(row => [...row]);
        let next_F = this.F.map(row => [...row]);
        const half = N / 2;

        for (let i = 1; i < N - 1; i++) {
            for (let j = 1; j < N - 1; j++) {
                const x = (j - half + 0.5) * dx;
                const y = (i - half + 0.5) * dx;
                const r = Math.sqrt(x * x + y * y);
                if (r > 1.0) continue;

                const rho_c = this.rho[i][j];
                const rho_u = this.rho[i - 1][j];
                const rho_d = this.rho[i + 1][j];
                const rho_l = this.rho[i][j - 1];
                const rho_r = this.rho[i][j + 1];

                // ① Reaction
                const R = calc_reaction(rho_c, current_pi_int, lambda_0, kappa);

                // ① Diffusion (v13.1: D_mask = D0 / (1 + (pi_ext + pi_int) / pi_0))
                const D = calc_diffusion(rho_c, rho_u, rho_d, rho_l, rho_r, dx, D0, pi_ext, current_pi_int, pi_0);

                // ① + ③ Advection
                const Fc = this.F[i][j];
                const Fl = this.F[i][j - 1];
                const Fr = this.F[i][j + 1];
                const Fu = this.F[i - 1][j];
                const Fd = this.F[i + 1][j];
                const A = calc_advection(rho_c, rho_u, rho_d, rho_l, rho_r, Fc, Fl, Fr, Fu, Fd, dx, v_coeff);

                // Noise
                let noise = 0;
                if (rho_c > (c.noise_cutoff !== undefined ? c.noise_cutoff : 0.001) || current_pi_int >= lambda_0) {
                    noise = calc_noise(noise_sigma, dt);
                }

                // ② Boundary flux (Sensory Gating)
                let boundary = 0;
                if (r > 0.9 && r <= 1.0) {
                    const gate = Math.max(0.0, current_pi_int - (c.gate_threshold !== undefined ? c.gate_threshold : 0.8));
                    const active_flux = boundary_flux * gate;

                    if (c.sensory_type === "uniform") {
                        boundary = active_flux * pi_ext;
                    } else {
                        const theta = Math.atan2(y, x);
                        const theta_stim = current_time * 0.001;
                        let d_theta = Math.abs(theta - theta_stim) % (2 * Math.PI);
                        if (d_theta > Math.PI) d_theta = 2 * Math.PI - d_theta;
                        const sig = c.sensory_sigma || 0.1;
                        const I_theta = Math.exp(-d_theta * d_theta / sig);
                        boundary = active_flux * pi_ext * I_theta;
                    }
                }

                next_rho[i][j] = Math.max(0, rho_c + (R + D + A) * dt + noise + boundary * dt);

                // ④ F update (v13.1: τ_F with r_0 offset and rho_0 normalization)
                const F0 = 0.5 * r * r;
                const tau_F = tau_base / (((r + r_0) / R_bound) * (1.0 + rho_c / rho_0));

                const weathering = -(Fc - F0);
                const erosion = calc_erosion(this.rho, j, i, N, this.k_rad, this.W_kernel, erosion_coeff);

                next_F[i][j] = Fc + ((weathering + erosion) / tau_F) * dt;
            }
        }
        this.rho = next_rho;
        this.F = next_F;
    }
}
