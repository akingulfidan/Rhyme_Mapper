import { RhymeGraph } from "./graph.js";
import { init_input } from "./input.js";
import { init_tabs } from "./tabs.js";
import { init_filters } from "./filters.js";
import { init_settings } from "./settings.js";
import { init_parameters } from "./parameters.js";

// Initialize graph canvas

const rhymeGraph = new RhymeGraph();

window.addEventListener("resize", () => {
  rhymeGraph.resizeCanvas();
});

init_tabs();
await init_input(rhymeGraph);
init_filters(rhymeGraph);
init_parameters(rhymeGraph);
init_settings();

// Get version
const version_response = await fetch("/version");
const version = await version_response.json();
console.log(version);