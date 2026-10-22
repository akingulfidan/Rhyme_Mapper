/*
Module for functionality related to filtering of rhyme paths.

Code for Rhyme Mapper is refactored into modules which then expose select functionality to main.js via an exported init function.
*/

// See filter_functions.js for a detailed explanation of filters.
import { min_length_filter, max_length_filter } from "./filter_functions.js";

export function init_filters(rhymeGraph) {
  // Function to initialize filters

  const filters = new Set(); // Set of active filters

  // Initialize min lenght filter
  const MinLengthFilter = document.getElementById("MinLength");
  const MinLengthFilterLabel = document.getElementById("MinLengthFilterValue");
  const EnableMinLengthFilter = document.getElementById("EnableMinLength");
  attach_filter(rhymeGraph, filters, min_length_filter, MinLengthFilter, EnableMinLengthFilter, MinLengthFilterLabel);

  // Initialize max length filter
  const MaxLengthFilter = document.getElementById("MaxLength");
  const MaxLengthFilterLabel = document.getElementById("MaxLengthFilterValue");
  const EnableMaxLengthFilter = document.getElementById("EnableMaxLength");
  attach_filter(rhymeGraph, filters, max_length_filter, MaxLengthFilter,EnableMaxLengthFilter ,MaxLengthFilterLabel);
}

function attach_filter(
  rhymeGraph,
  filters,
  filter_function,
  filter_input,
  filter_enable,
  filter_label,
) {
  // Sets the first instance of the criterion with default input value.
  let criterion = filter_function(Number(filter_input.value));

  filter_enable.addEventListener("change", () => {
    // If filter is enabled or disable add or remove the filter function from filters and call filter.
    if (filter_enable.checked) {
      filters.add(criterion);
    } else {
      filters.delete(criterion);
    }
    rhymeGraph.filter(filters);
  });

  filter_input.addEventListener("input", () => {
    // When filter value is changed update the filter function with the new value and if the filter is enabled call filter.

    const value = filter_input.value;
    filter_label.textContent = value; // Update Input Label

    filters.delete(criterion);
    criterion = filter_function(Number(value));

    if (filter_enable.checked) {
      filters.add(criterion);
      rhymeGraph.filter(filters);
    }
    
  });

  // Push a callback to the Rhyme Graph to update max valuies of filters when new data comes in.
  rhymeGraph.onDataChanged.push(() => {
    filter_input.max = rhymeGraph.maxPathLength;
  });
}
