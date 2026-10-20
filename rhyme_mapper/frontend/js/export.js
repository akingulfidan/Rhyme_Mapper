import * as svgExport from "./lib/svg-export.esm.min.js";

export function init_export(rhymeGraph) {
  init_svg_export(rhymeGraph);
}

function init_svg_export(rhymeGraph) {
  const export_button = document.getElementById("exportSvg");

  export_button.addEventListener("click", async () => {
    await svgExport.downloadSvg(rhymeGraph.getSvgElement(), "export_svg");
  });
}
