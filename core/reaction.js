// /core/reaction.js
// CFD v13.1 ① Terms 3-4: (pi_int - lambda_0)*rho - kappa*rho^2
// Transcritical bifurcation at pi_int = lambda_0
export function calc_reaction(c, pi_int, lambda_0, kappa) {
    return (pi_int - lambda_0) * c - kappa * c * c;
}
