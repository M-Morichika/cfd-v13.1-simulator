// /core/noise.js
// CFD v13.1 stochastic term: Wiener process scaled by sqrt(dt)
export function randn() {
    let u = 1 - Math.random();
    let v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function calc_noise(sigma, dt) {
    return sigma * randn() * Math.sqrt(dt);
}
