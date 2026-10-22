/*
Module for functionality related to parameters of the visualization.

Code for Rhyme Mapper is refactored into modules which then expose select functionality to main.js via an exported init function.
*/

export function init_parameters(rhymeGraph) {
  init_graph_mode(rhymeGraph);
}


function init_graph_mode(rhymeGraph) {
  // Attach listener to graph mode select
  const graph_mode = document.getElementById("graphMode");

  graph_mode.addEventListener("change", (event) => {
    const graph_mode = event.target.value;
    rhymeGraph.graphMode(graph_mode);
  });
}
