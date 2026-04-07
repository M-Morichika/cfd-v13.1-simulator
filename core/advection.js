// /core/advection.js
// CFD v13.1 ① Term 1 + ③: -div(rho * v), where v = -B/gamma(G) * grad(F)
// Upwind scheme for numerical stability
export function calc_advection(c, up, down, left, right, Fc, Fl, Fr, Fu, Fd, dx, v_coeff) {
    const v_max = 5.0;

    let vx_L = Math.max(-v_max, Math.min(v_max, -v_coeff * (Fc - Fl) / dx));
    let vx_R = Math.max(-v_max, Math.min(v_max, -v_coeff * (Fr - Fc) / dx));
    let vy_U = Math.max(-v_max, Math.min(v_max, -v_coeff * (Fc - Fu) / dx));
    let vy_D = Math.max(-v_max, Math.min(v_max, -v_coeff * (Fd - Fc) / dx));

    let flux_x_L = (vx_L > 0) ? vx_L * left : vx_L * c;
    let flux_x_R = (vx_R > 0) ? vx_R * c : vx_R * right;
    let flux_y_U = (vy_U > 0) ? vy_U * up : vy_U * c;
    let flux_y_D = (vy_D > 0) ? vy_D * c : vy_D * down;

    return (flux_x_L - flux_x_R + flux_y_U - flux_y_D) / dx;
}
