import { RhymeGraph } from "./graph.js";
import { init_input } from "./input.js";
import { init_tabs } from "./tabs.js";
import { init_filters } from "./filters.js";
import { init_settings } from "./settings.js";
import { init_parameters } from "./parameters.js";
import { init_export } from "./export.js";

// Initialize graph instance
const rhymeGraph = new RhymeGraph();

// Listener to resive the visualization when window size changes
window.addEventListener("resize", () => {
  rhymeGraph.resizeCanvas();
});

// Initialize modules
init_tabs();
await init_input(rhymeGraph);
init_filters(rhymeGraph);
init_parameters(rhymeGraph);
init_export(rhymeGraph);
init_settings();

// Get version
const version_response = await fetch("/api/version");
const version = await version_response.json();
console.log(version);