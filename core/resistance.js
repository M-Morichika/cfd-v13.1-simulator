// /core/resistance.js
// CFD v13.1 ⑤ + ③: G[rho,F] and gamma(G) sigmoid viscosity

// ⑤ G[rho, F] = k_G * ∫∫ rho * F dr dθ
// Discrete approximation on Cartesian grid within unit disk
export function calc_G(rho, F, N, dx, k_G = 1.0) {
    let sum = 0;
    const half = N / 2;
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const x = (j - half + 0.5) * dx;
            const y = (i - half + 0.5) * dx;
            const r = Math.sqrt(x * x + y * y);
            if (r > 1.0 || r < 0.01) continue;
            sum += rho[i][j] * F[i][j] * dx * dx;
        }
    }
    return k_G * sum;
}

// ③ gamma(G) = gamma_min + (gamma_max - gamma_min) / (1 + exp(-a*(G - G_th)))
export function calc_gamma(G, gamma_min, gamma_max, steepness, threshold) {
    const sigmoid = 1.0 / (1.0 + Math.exp(-steepness * (G - threshold)));
    return gamma_min + (gamma_max - gamma_min) * sigmoid;
}
