# CFD v13.1 Simulator

Browser-based numerical simulator for **Cognitive Field Dynamics (CFD) v13.1** — a mathematical model of cognition that reformulates the Free Energy Principle as fluid dynamics on a bounded 2D disk (caldera model).

## What's new in v13.1

| Change | v12.5 | v13.1 |
|--------|-------|-------|
| D_mask | D₀ / (π_ext + π_int) | D₀ / (1 + (π_ext + π_int) / π₀) |
| τ_F | τ_base / (r · (1 + λρ)) | τ_base / ((r + r₀)/R · (1 + ρ/ρ₀)) |
| G scaling | k ∫∫ ρF | k_G ∫∫ ρF |
| β* definition | field peak | observable with existence conditions |
| Analysis | — | σ² derivation, dual structure, hysteresis |
| FEP relation | phenomenological analogy | variational gradient flow correspondence |
| Presets | 3 (phase transition, localization, hysteresis) | 7 (+propofol, ketamine, midazolam, desflurane) |
| Config loading | CSV parser | direct ES module import |

Key improvements:
- **r₀ offset** in τ_F prevents divergence at r→0 while preserving rigidity of the core
- **π₀ reference precision** ensures D_mask remains bounded and dimensionally consistent
- **ρ₀ normalization** provides dimensionless coupling in the F update equation
- **Anesthetic sweep presets** model distinct pharmacological profiles

## Equation system

All six coupled equations of CFD v13.1 are implemented:

| Eq. | Name | File | Status |
|-----|------|------|--------|
| (1) | ρ evolution (advection-diffusion-reaction) | `sim/cfd_solver.js` | ✅ Full |
| (2) | Boundary flux at r=1 (Markov blanket) | `sim/cfd_solver.js` | ✅ Sensory gating with I(θ,t) |
| (3) | Flow velocity v = −B/γ(G)·∇F | `core/advection.js` + `core/resistance.js` | ✅ Full |
| (4) | γ(G) defensive viscosity sigmoid | `core/resistance.js` | ✅ Full |
| (5) | F terrain update (weathering + W-kernel erosion) | `sim/cfd_solver.js` + `core/erosion.js` | ✅ r₀ offset, ρ₀ norm |
| (6) | G[ρ,F] transformation resistance | `core/resistance.js` | ✅ k_G scaling |

### Implementation notes

- **D_mask** (Eq. 1): `D₀ / (1 + (π_ext + π_int) / π₀)` with reference precision π₀ = 1.0 by default.
- **τ_F** (Eq. 5): `τ_base / ((r + r₀)/R · (1 + ρ/ρ₀))` with r₀ = 0.1, ρ₀ = 1.0 by default. The offset r₀ prevents τ_F → ∞ at r = 0.
- **② Boundary flux**: Sensory gating with `gate = max(0, π_int − gate_threshold)`. Two modes: `"uniform"` (isotropic) and `"beam"` (directional I(θ,t) with Gaussian angular profile).
- **④ W-kernel**: 2D Gaussian kernel with configurable σ (`W_sigma`). Convolution is windowed to `2σ` radius for performance.
- **Noise suppression**: When ρ < noise_cutoff and π_int < λ₀ (deep anesthesia), stochastic noise is suppressed to prevent spurious re-ignition. This is a modeling choice not present in the formal equations.

## Experiments

1. **Phase transition** — π_int sweeps across λ₀: consciousness ignites and extinguishes
2. **Propofol** — Smooth cosine induction/emergence modeling GABAergic anesthesia
3. **Ketamine** — Dissociative fluctuation: irregular oscillation near the threshold
4. **Midazolam** — Shallow sedation: slow, bottoms at π_int ≈ 0.6
5. **Desflurane** — Rapid on/off: near-rectangular sweep via tanh
6. **Localization** — Low diffusion + strong erosion creates persistent attractor trapping (PTSD/DID)
7. **Hysteresis** — π_int sine sweep reveals asymmetric ignition/extinction (history dependence)

## Observables

- **M(t)**: Total ρ mass (blue line) — consciousness level / order parameter
- **L(t)**: Localization index max(ρ)/M (yellow line) — attention focus sharpness
- **β\* trajectory**: Path of argmax ρ (yellow trail on heatmap) — stream of consciousness
- **G**: Global transformation resistance (status bar)
- **γ**: Defensive viscosity (status bar)
- **Focus (x, y)**: Physical coordinates of β\* (header); displays "(none)" when existence conditions are not met

## File structure

```
config/experiments.js    — Parameter presets (7 experiments, all constants)
core/index.js            — Re-export of all core modules
core/reaction.js         — (1) Terms 3-4: (π_int − λ₀)ρ − κρ²
core/diffusion.js        — (1) Term 2: D₀/(1 + (π_ext + π_int)/π₀) · ∇²ρ
core/advection.js        — (1) Term 1: −∇·(ρv), upwind scheme
core/erosion.js          — (5) W-kernel spatial convolution
core/resistance.js       — (6) G[ρ,F] with k_G + (4) γ(G) sigmoid
core/noise.js            — Wiener process with √dt scaling
sim/cfd_solver.js        — Main integrator ((1)(2)(5) assembled, v13.1 τ_F)
sim/app.js               — UI controller, sweep logic, β* tracking
viz/render.js            — Heatmap + F contours + β* trail + charts + loop
index.html               — Layout + MathJax equation panel (v13.1 refs)
```

## How to run

Serve with any static HTTP server:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Open `http://localhost:8000` (or `:3000` for npx serve).

ES modules require HTTP — opening `index.html` directly as a file will not work.

## Reproducibility

All parameters are defined in `config/experiments.js`. To reproduce:

1. Select a preset from the dropdown
2. All parameter values are displayed in the control panel
3. The simulation is deterministic up to the stochastic noise term (Box-Muller)

To add a custom experiment, add an entry to `experimentPresets` in `config/experiments.js`.

## Parameter reference

| Parameter | Eq. | Description | Unit | Default |
|-----------|-----|-------------|------|---------|
| `N`, `dx`, `dt` | — | Grid resolution, spacing, timestep | — | 60, 0.0333, 0.002 |
| `lambda_0` | (1) | Dissipation rate (ignition threshold) | [T⁻¹] | 1.0 |
| `pi_int` | (1) | Internal metabolic drive | [T⁻¹] | varies |
| `pi_ext` | (1)(2) | External processing rate | [T⁻¹] | 0.5 |
| `pi_0` | (1) | Reference precision rate for D_mask | [T⁻¹] | 1.0 |
| `kappa` | (1) | Self-inhibition coefficient | [L²T⁻¹] | varies |
| `D0` | (1) | Base diffusion coefficient | [L²T⁻¹] | varies |
| `noise_sigma` | (1) | Stochastic noise amplitude | — | 0.001 |
| `B` | (3) | Velocity dimension conversion | [L²I⁻¹T⁻¹] | 0.5 |
| `gamma_min/max` | (4) | Viscosity sigmoid bounds | — | 0.2 / 5.0 |
| `G_threshold` | (4)(6) | Sigmoid inflection point | [I] | 0.5 |
| `G_steepness` | (4) | Sigmoid steepness parameter a | [I⁻¹] | 10.0 |
| `k_G` | (6) | Transformation resistance scaling | — | 1.0 |
| `tau_base` | (5) | F-update base time constant | [T] | varies |
| `r_0` | (5) | Residual plasticity at center | [L] | 0.1 |
| `rho_0` | (5) | Reference information density | [L⁻²] | 1.0 |
| `erosion_coeff` | (5) | Erosion strength c_ero | — | varies |
| `W_sigma` | (5) | W-kernel Gaussian width | [L] | varies |
| `boundary_flux` | (2) | External flux injection strength | — | 0.1 |
| `sensory_sigma` | (2) | Angular width of I(θ,t) | [rad] | 0.2 |
| `sensory_type` | (2) | `"uniform"` or `"beam"` | — | "beam" |

## References

- **Cognitive Field Dynamics v13.1**: Morichika, M. (2026). *Cognitive Field Dynamics: A Fluid-Mechanical Formulation of Belief Dynamics on a Bounded Polar Domain.* [ResearchGate](https://www.researchgate.net/publication/403279648)
- Friston, K. (2010). The free-energy principle: a unified brain theory? *Nature Reviews Neuroscience*, 11(2), 127–138.
- Amari, S. (1977). Dynamics of pattern formation in lateral-inhibition type neural fields. *Biological Cybernetics*, 27(2), 77–87.
- Risken, H. (1989). *The Fokker-Planck Equation*. Springer.
- Alkire, M. T., Hudetz, A. G., & Tononi, G. (2008). Consciousness and anesthesia. *Science*, 322(5903), 876–880.

## License

MIT License. See [LICENSE](LICENSE).
