import { min_length_filter, max_length_filter } from "./filter_functions.js";

export function init_filters(rhymeGraph) {
  const filters = new Set();
  min_path_length_slider(rhymeGraph, filters);
  max_path_length_slider(rhymeGraph, filters);
}

// Min Length Filter
function min_path_length_slider(rhymeGraph, filters) {
  const MinLengthFilter = document.getElementById("MinLength");
  const MinLengthFilterLabel = document.getElementById("MinLengthFilterValue");
  const EnableMinLengthFilter = document.getElementById("EnableMinLength");

  let min_length = min_length_filter(Number(MinLengthFilter.value));

  EnableMinLengthFilter.addEventListener("change", () => {
    if (EnableMinLengthFilter.checked) {
      filters.add(min_length);
      rhymeGraph.filter(filters);
    } else {
      filters.delete(min_length);
      rhymeGraph.filter(filters);
    }
  });

  MinLengthFilter.addEventListener("input", () => {
    const value = MinLengthFilter.value;
    MinLengthFilterLabel.textContent = value;
    if (EnableMinLengthFilter.checked) {
      filters.delete(min_length);
      min_length = min_length_filter(Number(value));
      filters.add(min_length);
      rhymeGraph.filter(filters);
    }
  });

  rhymeGraph.onDataChanged.push(() => {
    MinLengthFilter.max = rhymeGraph.maxPathLength;
  });
}

// Max Length Filter
function max_path_length_slider(rhymeGraph, filters) {
  const MaxLengthFilter = document.getElementById("MaxLength");
  const MaxLengthFilterLabel = document.getElementById("MaxLengthFilterValue");
  const EnableMaxLengthFilter = document.getElementById("EnableMaxLength");

  let max_length = max_length_filter(Number(MaxLengthFilter.value));

  EnableMaxLengthFilter.addEventListener("change", () => {
    filters.add(max_length);
    filters.delete(max_length);

    if (EnableMaxLengthFilter.checked) {
      rhymeGraph.filter(filters);
    }
  });

  MaxLengthFilter.addEventListener("input", () => {
    const value = MaxLengthFilter.value;
    MaxLengthFilterLabel.textContent = value;

    filters.delete(max_length);
    max_length = max_length_filter(Number(value));
    filters.add(max_length);

    if (EnableMaxLengthFilter.checked) {
      rhymeGraph.filter(filters);
    }
  });

  rhymeGraph.onDataChanged.push(() => {
    MaxLengthFilter.max = rhymeGraph.maxPathLength;
  });
}
