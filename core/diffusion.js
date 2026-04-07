// /core/diffusion.js
// CFD v13.1 ① Term 2: D_mask = D0 / (1 + (pi_ext + pi_int) / pi_0)
// Standard 5-point Laplacian on Cartesian grid
export function calc_diffusion(c, up, down, left, right, dx, D0, pi_ext, pi_int, pi_0 = 1.0) {
    const D_mask = D0 / (1.0 + (pi_ext + pi_int) / pi_0);
    const laplacian = (up + down + left + right - 4 * c) / (dx * dx);
    return D_mask * laplacian;
}
