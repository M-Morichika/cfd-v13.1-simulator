// /core/erosion.js
// CFD v13.1 ④ Erosion term with spatial convolution (W-kernel)
// erosion = - c_ero * ∫∫ W(x, y; x', y') ρ(x', y') dx' dy'

export function calc_erosion(rho, cx, cy, N, k_rad, W_kernel, c_ero) {
    let sum = 0;
    const min_i = Math.max(0, cy - k_rad);
    const max_i = Math.min(N - 1, cy + k_rad);
    const min_j = Math.max(0, cx - k_rad);
    const max_j = Math.min(N - 1, cx + k_rad);

    for (let i = min_i; i <= max_i; i++) {
        const ky = i - cy + k_rad;
        for (let j = min_j; j <= max_j; j++) {
            const kx = j - cx + k_rad;
            sum += rho[i][j] * W_kernel[ky][kx];
        }
    }
    return -c_ero * sum;
}
