import * as svgExport from "svg-exportjs-browser";

export function init_export(rhymeGraph) {
  init_svg_export(rhymeGraph);
  init_png_export(rhymeGraph);
  init_jpeg_export(rhymeGraph);
}

function init_svg_export(rhymeGraph) {
  const export_button = document.getElementById("exportSvg");

  export_button.addEventListener("click", async () => {
    await svgExport.downloadSvg(rhymeGraph.getSvgElement(), "svg_export");
  });
}

function init_png_export(rhymeGraph) {
  const export_button = document.getElementById("exportPng");

  export_button.addEventListener("click", async () => {
    await svgExport.downloadPng(rhymeGraph.getSvgElement(), "png_export");
  });
}

function init_jpeg_export(rhymeGraph) {
  const export_button = document.getElementById("exportJpeg");

  export_button.addEventListener("click", async () => {
    await svgExport.downloadJpeg(rhymeGraph.getSvgElement(), "jpeg_export");
  });
}