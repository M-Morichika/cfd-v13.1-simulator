// /sim/app.js
// CFD v13.1 simulator - main application
import { CFDSolver } from './cfd_solver.js';
import { Renderer } from '../viz/render.js';
import { experimentPresets } from '../config/experiments.js';

let solver, renderer;
let isRunning = true;
let currentConfig;
let startTime = 0;

let history_M = new Array(5000).fill(0);
let history_pi = new Array(5000).fill(0);
let history_L = new Array(5000).fill(0);
let betaTrail = [];

function loadExperiment(key) {
    const preset = experimentPresets[key];
    if (!preset) return;
    currentConfig = preset.params;
    solver = new CFDSolver(currentConfig);
    renderer = new Renderer('heatCanvas', 'chartCanvas', 'loopCanvas', currentConfig.N);

    history_M.fill(0);
    history_pi.fill(currentConfig.pi_int);
    history_L.fill(0);
    betaTrail = [];
    startTime = Date.now();

    // Seed initial density for anesthetic/phase transition presets
    const seedPresets = ["phase_transition", "propofol", "ketamine", "midazolam", "desflurane"];
    if (seedPresets.includes(key)) {
        const center = Math.floor(currentConfig.N / 2);
        solver.rho[center][center] = 2.0;
        solver.rho[center - 1][center] = 1.0;
        solver.rho[center + 1][center] = 1.0;
        solver.rho[center][center - 1] = 1.0;
        solver.rho[center][center + 1] = 1.0;
    }

    const params = Object.entries(currentConfig).map(([k, v]) => `<b>${k}</b>: ${v}`).join(' | ');
    document.getElementById('paramDisplay').innerHTML = params;
    document.getElementById('pi_slider').value = currentConfig.pi_int;
}

function init() {
    const select = document.getElementById('presetSelect');
    Object.keys(experimentPresets).forEach(key => {
        let opt = document.createElement('option');
        opt.value = key;
        opt.text = experimentPresets[key].name;
        select.add(opt);
    });

    select.addEventListener('change', (e) => loadExperiment(e.target.value));
    document.getElementById('btnRun').addEventListener('click', () => isRunning = !isRunning);
    document.getElementById('btnReset').addEventListener('click', () => {
        loadExperiment(document.getElementById('presetSelect').value);
    });

    loadExperiment(select.value);
    requestAnimationFrame(loop);
}

function loop(timestamp) {
    if (isRunning) {
        let current_pi = parseFloat(document.getElementById('pi_slider').value);
        let piValElement = document.getElementById('pi_val');

        piValElement.innerText = current_pi.toFixed(2);

        if (current_pi >= currentConfig.lambda_0) {
            piValElement.style.color = "#ff5555";
            piValElement.style.fontWeight = "bold";
        } else {
            piValElement.style.color = "#ffffff";
            piValElement.style.fontWeight = "normal";
        }

        // Sweep modes (anesthetic profiles from v8)
        if (currentConfig.sweep_mode) {
            let t = Math.max(0, Date.now() - startTime) * 0.001 * currentConfig.sweep_freq;

            switch (currentConfig.sweep_type) {
                case "anesthesia":
                    // Propofol-like smooth cosine sweep
                    current_pi = Math.max(0.1, 0.8 + 0.7 * Math.cos(t));
                    break;
                case "ketamine":
                    // Dissociative: irregular fluctuation near threshold
                    current_pi = 0.95 + 0.15 * Math.sin(t) + 0.1 * Math.cos(t * 2.3);
                    break;
                case "midazolam":
                    // Shallow sedation: slow, bottoms at ~0.6
                    current_pi = Math.max(0.6, 1.05 + 0.45 * Math.cos(t));
                    break;
                case "desflurane":
                    // Rapid on/off: near-rectangular via tanh
                    current_pi = 0.85 + 0.65 * Math.tanh(5.0 * Math.cos(t));
                    break;
                case "sine":
                    // Generic sine sweep for hysteresis
                    current_pi = 1.0 + 0.5 * Math.sin(t);
                    break;
                default:
                    current_pi = 1.0 + 0.5 * Math.sin(t);
            }
            document.getElementById('pi_slider').value = current_pi.toFixed(2);
        }

        solver.step(timestamp, current_pi);

        let max_rho = 0;
        let total_M = 0;
        let max_i = solver.N / 2, max_j = solver.N / 2;

        for (let i = 0; i < solver.N; i++) {
            for (let j = 0; j < solver.N; j++) {
                let val = solver.rho[i][j];
                if (val > max_rho) {
                    max_rho = val;
                    max_i = i; max_j = j;
                }
                total_M += isNaN(val) ? 0 : val;
            }
        }

        let L_val = (total_M > 0.0001) ? (max_rho / total_M) : 0;

        history_M.push(total_M); history_M.shift();
        history_pi.push(current_pi); history_pi.shift();
        history_L.push(L_val); history_L.shift();

        if (max_rho > 0.05) {
            betaTrail.push({ i: max_i, j: max_j });
            if (betaTrail.length > 80) betaTrail.shift();
        } else if (betaTrail.length > 0) {
            betaTrail.shift();
        }

        renderer.drawHeatmap(solver.rho, solver.F, max_rho, betaTrail);
        renderer.drawChart(history_M, history_pi, history_L);
        renderer.drawLoop(history_pi, history_M);

        if (max_rho > 0.05) {
            let phys_x = (max_j - solver.N / 2 + 0.5) * currentConfig.dx;
            let phys_y = (max_i - solver.N / 2 + 0.5) * currentConfig.dx;
            document.getElementById('coordDisplay').innerText = `Focus (x: ${phys_x.toFixed(2)}, y: ${phys_y.toFixed(2)})`;
        } else {
            document.getElementById('coordDisplay').innerText = `Focus (none)`;
        }

        document.getElementById('rhoDisplay').innerText =
            `Max ρ: ${max_rho.toFixed(3)} | M: ${total_M.toFixed(3)} | G: ${solver.G.toFixed(3)} | γ: ${solver.gamma.toFixed(3)}`;
    }
    requestAnimationFrame(loop);
}

init();
