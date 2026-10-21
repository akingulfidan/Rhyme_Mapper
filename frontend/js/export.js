import * as svgExport from "svg-exportjs-browser";

export function init_export(rhymeGraph) {
  init_svg_export(rhymeGraph);
}

function init_svg_export(rhymeGraph) {
  const export_button = document.getElementById("exportSvg");

  export_button.addEventListener("click", async () => {
    await svgExport.downloadSvg(rhymeGraph.getSvgElement(), "export_svg");
  });
}
