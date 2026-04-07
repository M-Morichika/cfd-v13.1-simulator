# CFD v13.1 Simulator

Browser-based numerical simulator for **Cognitive Field Dynamics (CFD) v13.1** — a mathematical model of cognition that reformulates the Free Energy Principle as fluid dynamics on a bounded 2D disk (caldera model).

**Core claim**: Attention is not a state but an *observable with existence conditions*, defined as β\* = argmax ρ. Its emergence and extinction correspond to a phase transition governed by π\_int = λ₀.

## Reference paper

> Morichika, M. (2026). *Cognitive Field Dynamics: A Fluid-Mechanical Formulation of Belief Dynamics on a Bounded Polar Domain* (v13.1).
> [ResearchGate](https://www.researchgate.net/publication/403279648_Cognitive_Field_Dynamics_A_Fluid-Mechanical_Formulation_of_Belief_Dynamics_on_a_Bounded_Polar_Domain)

## Quick start

```bash
npx serve .
# or
python3 -m http.server 8000
```

Open `http://localhost:8000` (or `:3000` for npx serve).

ES modules require HTTP — opening `index.html` directly as a file will not work.

**To try it immediately**: Select a preset from the dropdown → click **Run** → drag the π\_int slider.

## Preset → Phenomenon mapping

| Preset | Phenomenon | Key observation |
|--------|------------|----------------|
| Phase transition | Ignition / extinction | M(t): 0 ⇄ nonzero, β\* appears/disappears |
| Propofol | Smooth anesthesia | Continuous suppression of M(t) |
| Ketamine | Dissociative fluctuation | Irregular oscillation near threshold |
| Midazolam | Shallow sedation | Partial reduction, M(t) > 0 maintained |
| Desflurane | Rapid switching | Abrupt on/off transition |
| Localization | PTSD/DID-like trapping | High L(t), persistent β\* |
| Hysteresis | History dependence | Asymmetric M(t) trajectory |

All presets are defined in `config/experiments.js` and can be modified to explore parameter sensitivity.

## Equation system

All six coupled equations of CFD v13.1 are implemented:

| Eq. | Name | File | Status |
|-----|------|------|--------|
| ① | ρ evolution (advection-diffusion-reaction) | `sim/cfd_solver.js` | ✅ Full |
| ② | Boundary flux at r=1 (Markov blanket) | `sim/cfd_solver.js` | ✅ Sensory gating with I(θ,t) |
| ③ | Flow velocity v = −B/γ(G)·∇F | `core/advection.js` + `core/resistance.js` | ✅ Full |
| ④ | γ(G) sigmoid viscosity | `core/resistance.js` | ✅ Full |
| ⑤ | F terrain update (weathering + W-kernel erosion) | `sim/cfd_solver.js` + `core/erosion.js` | ✅ 2D Gaussian convolution |
| ⑥ | G[ρ,F] transformation resistance | `core/resistance.js` | ✅ Full |

### v12.5 → v13.1 changes

- **D\_mask**: `D₀/(π_ext + π_int)` → `D₀/(1 + (π_ext + π_int)/π₀)` — dimensionally consistent with reference precision π₀
- **τ\_F**: `τ_base/(r·(1+λρ))` → `τ_base/((r+r₀)/R · (1+ρ/ρ₀))` — r₀ offset prevents divergence at r→0; ρ₀ provides dimensionless normalization
- **G**: `k·∫∫` → `k_G·∫∫` — explicit scaling constant
- **New parameters**: `pi_0` (reference precision rate), `rho_0` (reference information density), `r_0` (residual plasticity), `k_G` (G scaling constant)

### Implementation notes

- **② Boundary flux**: Implements sensory gating with `gate = max(0, π_int − gate_threshold)`. Supports two modes: `"uniform"` (isotropic) and `"beam"` (directional I(θ,t) with Gaussian angular profile).
- **⑤ W-kernel**: 2D Gaussian kernel with configurable σ (`W_sigma`). Convolution is windowed to `2σ` radius for performance.
- **Noise suppression**: When ρ < noise\_cutoff and π\_int < λ₀ (deep anesthesia), stochastic noise is suppressed to prevent spurious re-ignition. This is a modeling choice not present in the formal equations.

## Observables

- **M(t)**: Total ρ mass (blue line) — consciousness level
- **L(t)**: Localization index max(ρ)/M (yellow line) — attention focus
- **β\* trajectory**: Path of argmax ρ (yellow trail on heatmap) — stream of consciousness
- **G**: Global transformation resistance (status bar)
- **γ**: Defensive viscosity (status bar)
- **Focus (x, y)**: Physical coordinates of β\* (header)
- **Hysteresis loop**: π\_int vs M phase portrait (top-left panel) — visualizes history dependence

## File structure

```
config/experiments.js    — Parameter presets (7 scenarios, all constants)
core/reaction.js         — ① Terms 3-4: (π_int − λ₀)ρ − κρ²
core/diffusion.js        — ① Term 2: D₀/(1+(π_ext+π_int)/π₀) · ∇²ρ
core/advection.js        — ① Term 1: −∇·(ρv), upwind scheme
core/erosion.js          — ⑤ W-kernel spatial convolution
core/resistance.js       — ⑥ G[ρ,F] + ④ γ(G) sigmoid
core/noise.js            — Wiener process with √dt scaling
core/index.js            — Re-export of all core modules
sim/cfd_solver.js        — Main integrator (①②⑤ assembled, v13.1 τ_F)
sim/app.js               — UI controller, sweep logic, β* tracking
viz/render.js            — Heatmap + F contours + β* trail + charts + loop
index.html               — Layout + MathJax equation panel
```

## Reproducibility

All parameters are defined in `config/experiments.js`. To reproduce:

1. Select a preset from the dropdown
2. All parameter values are displayed in the control panel
3. The simulation is deterministic up to the stochastic noise term (Box-Muller)

To add a custom experiment, add an entry to `experimentPresets` in `config/experiments.js`.

## Parameter reference

| Parameter | Eq. | Description | Unit |
|-----------|-----|-------------|------|
| `N`, `dx`, `dt` | — | Grid resolution, spacing, timestep | — |
| `lambda_0` | ① | Dissipation rate (ignition threshold) | [1/T] |
| `pi_int` | ① | Internal metabolic drive | [1/T] |
| `pi_ext` | ①② | External processing rate | [1/T] |
| `pi_0` | ① | Reference precision rate (v13.1) | [1/T] |
| `kappa` | ① | Self-inhibition coefficient | [L²/T] |
| `D0` | ① | Base diffusion coefficient | [L²/T] |
| `noise_sigma` | ① | Stochastic noise amplitude | — |
| `B` | ③ | Velocity dimension conversion | [L²/(I·T)] |
| `gamma_min/max` | ④ | Viscosity sigmoid bounds | — |
| `G_threshold` | ④⑥ | Sigmoid inflection point | [I] |
| `G_steepness` | ④ | Sigmoid steepness | [1/I] |
| `k_G` | ⑥ | Transformation resistance scaling (v13.1) | — |
| `tau_base` | ⑤ | F-update base time constant | [T] |
| `r_0` | ⑤ | Residual plasticity at center (v13.1) | [L] |
| `rho_0` | ⑤ | Reference information density (v13.1) | [L⁻²] |
| `erosion_coeff` | ⑤ | Erosion strength | — |
| `W_sigma` | ⑤ | W-kernel Gaussian width | [L] |
| `boundary_flux` | ② | External flux injection strength | — |
| `sensory_sigma` | ② | Angular width of I(θ,t) | [rad] |
| `sensory_type` | ② | `"uniform"` or `"beam"` | — |

## License

MIT License. See [LICENSE](LICENSE).
