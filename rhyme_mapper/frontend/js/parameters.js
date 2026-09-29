export function init_parameters(rhymeGraph) {
  init_graph_mode(rhymeGraph);
}


function init_graph_mode(rhymeGraph) {
  const graph_mode = document.getElementById("graphMode");

  graph_mode.addEventListener("change", (event) => {
    const graph_mode = event.target.value;
    rhymeGraph.graphMode(graph_mode);
  });
}
