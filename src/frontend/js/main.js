import { renderGraph, resizeCanvas, setupCanvas } from "./graph.js";

const superSampleLvl = 2;
const ctx = setupCanvas(superSampleLvl, "2d")

window.addEventListener('resize',() => {resizeCanvas(ctx, superSampleLvl); renderGraph(ctx)});

renderGraph(ctx);