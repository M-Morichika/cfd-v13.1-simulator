// /config/experiments.js
// CFD v13.1 experiment presets
// Unified: sim7_1 base presets + simx_v8 anesthetic sweep types
export const experimentPresets = {
    "phase_transition": {
        id: "phase_transition",
        name: "1. Phase transition (awake ↔ anesthesia)",
        params: {
            N: 60, dx: 0.0333, dt: 0.002,
            lambda_0: 1.0, pi_int: 1.5, kappa: 2.5,
            D0: 0.05, pi_ext: 0.5, pi_0: 1.0,
            noise_sigma: 0.001,
            B: 0.5, gamma_min: 0.2, gamma_max: 5.0,
            G_threshold: 0.5, G_steepness: 10.0, k_G: 1.0,

            tau_base: 0.3, erosion_coeff: 0.05, W_sigma: 0.2,
            r_0: 0.1, rho_0: 1.0,

            boundary_flux: 0.1, sensory_sigma: 0.2, sensory_type: "beam",
            gate_threshold: 0.8,
            noise_cutoff: 0.001,

            sweep_mode: true, sweep_type: "anesthesia", sweep_freq: 0.4
        }
    },
    "propofol": {
        id: "propofol",
        name: "2. Propofol (smooth induction/emergence)",
        params: {
            N: 60, dx: 0.0333, dt: 0.002,
            lambda_0: 1.0, pi_int: 1.5, kappa: 2.5,
            D0: 0.05, pi_ext: 0.5, pi_0: 1.0,
            noise_sigma: 0.001,
            B: 0.5, gamma_min: 0.2, gamma_max: 5.0,
            G_threshold: 0.5, G_steepness: 10.0, k_G: 1.0,

            tau_base: 0.3, erosion_coeff: 0.05, W_sigma: 0.2,
            r_0: 0.1, rho_0: 1.0,

            boundary_flux: 0.1, sensory_sigma: 0.2, sensory_type: "beam",
            gate_threshold: 0.8,
            noise_cutoff: 0.001,

            sweep_mode: true, sweep_type: "anesthesia", sweep_freq: 0.4
        }
    },
    "ketamine": {
        id: "ketamine",
        name: "3. Ketamine (dissociative fluctuation)",
        params: {
            N: 60, dx: 0.0333, dt: 0.002,
            lambda_0: 1.0, pi_int: 1.5, kappa: 2.5,
            D0: 0.05, pi_ext: 0.5, pi_0: 1.0,
            noise_sigma: 0.001,
            B: 0.5, gamma_min: 0.2, gamma_max: 5.0,
            G_threshold: 0.5, G_steepness: 10.0, k_G: 1.0,

            tau_base: 0.3, erosion_coeff: 0.05, W_sigma: 0.2,
            r_0: 0.1, rho_0: 1.0,

            boundary_flux: 0.1, sensory_sigma: 0.2, sensory_type: "beam",
            gate_threshold: 0.8,
            noise_cutoff: 0.001,

            sweep_mode: true, sweep_type: "ketamine", sweep_freq: 0.4
        }
    },
    "midazolam": {
        id: "midazolam",
        name: "4. Midazolam (shallow sedation)",
        params: {
            N: 60, dx: 0.0333, dt: 0.002,
            lambda_0: 1.0, pi_int: 1.5, kappa: 2.5,
            D0: 0.05, pi_ext: 0.5, pi_0: 1.0,
            noise_sigma: 0.001,
            B: 0.5, gamma_min: 0.2, gamma_max: 5.0,
            G_threshold: 0.5, G_steepness: 10.0, k_G: 1.0,

            tau_base: 0.3, erosion_coeff: 0.05, W_sigma: 0.2,
            r_0: 0.1, rho_0: 1.0,

            boundary_flux: 0.1, sensory_sigma: 0.2, sensory_type: "beam",
            gate_threshold: 0.8,
            noise_cutoff: 0.001,

            sweep_mode: true, sweep_type: "midazolam", sweep_freq: 0.4
        }
    },
    "desflurane": {
        id: "desflurane",
        name: "5. Desflurane (rapid on/off)",
        params: {
            N: 60, dx: 0.0333, dt: 0.002,
            lambda_0: 1.0, pi_int: 1.5, kappa: 2.5,
            D0: 0.05, pi_ext: 0.5, pi_0: 1.0,
            noise_sigma: 0.001,
            B: 0.5, gamma_min: 0.2, gamma_max: 5.0,
            G_threshold: 0.5, G_steepness: 10.0, k_G: 1.0,

            tau_base: 0.3, erosion_coeff: 0.05, W_sigma: 0.2,
            r_0: 0.1, rho_0: 1.0,

            boundary_flux: 0.1, sensory_sigma: 0.2, sensory_type: "beam",
            gate_threshold: 0.8,
            noise_cutoff: 0.001,

            sweep_mode: true, sweep_type: "desflurane", sweep_freq: 0.4
        }
    },
    "localization": {
        id: "localization",
        name: "6. Localization emergence (PTSD / DID)",
        params: {
            N: 60, dx: 0.0333, dt: 0.002,
            lambda_0: 1.0, pi_int: 1.5, kappa: 2.5,
            D0: 0.002, pi_ext: 0.5, pi_0: 1.0,
            noise_sigma: 0.015,
            B: 0.5, gamma_min: 0.2, gamma_max: 5.0,
            G_threshold: 0.5, G_steepness: 10.0, k_G: 1.0,

            tau_base: 8.0, erosion_coeff: 1.5, W_sigma: 0.08,
            r_0: 0.1, rho_0: 1.0,

            boundary_flux: 0.2, sensory_sigma: 0.2, sensory_type: "uniform",
            sweep_mode: false
        }
    },
    "hysteresis": {
        id: "hysteresis",
        name: "7. Hysteresis loop (π_int sine sweep)",
        params: {
            N: 60, dx: 0.0333, dt: 0.002,
            lambda_0: 1.0, pi_int: 1.0,
            kappa: 0.1,
            D0: 0.01, pi_ext: 0.5, pi_0: 1.0,
            noise_sigma: 0.001,
            B: 0.8, gamma_min: 0.2, gamma_max: 5.0,
            G_threshold: 0.5, G_steepness: 10.0, k_G: 1.0,

            tau_base: 2.0, erosion_coeff: 0.1, W_sigma: 0.15,
            r_0: 0.1, rho_0: 1.0,

            boundary_flux: 0.1, sensory_sigma: 0.2, sensory_type: "beam",
            sweep_mode: true, sweep_type: "sine",
            sweep_freq: 0.5
        }
    }
};
