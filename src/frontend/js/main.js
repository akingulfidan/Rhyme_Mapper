import { resizeCanvas } from "./graph.js";

const canvas = document.getElementById("phonemeGraph");
const ctx = canvas.getContext("2d");

window.addEventListener('resize',() => {resizeCanvas(canvas)});

resizeCanvas(canvas);