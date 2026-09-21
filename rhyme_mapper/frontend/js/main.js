import { RhymeGraph } from "./graph.js";
import { min_length_filter, max_length_filter } from "./filters.js";

// Get version
const version_response = await fetch("/version");
const version = await version_response.json();
console.log(version);

// Tabs
const tabs = document.querySelectorAll(".TabButton");
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target_tab = document.getElementById(tab.dataset.tab);
    document.querySelectorAll(".TabContent").forEach((tab_content) => {
      tab_content.hidden = true;
    });
    target_tab.hidden = false;
  });
});

// Language list dropdown

let lang_response = await fetch("/lang");
const languages = await lang_response.json();

const lang_dropdown = document.getElementById("language");

for (const [code, name] of Object.entries(languages)) {
  const option = document.createElement("option");

  option.value = code;
  option.textContent = name;

  lang_dropdown.appendChild(option);
}

// Initialize graph canvas

const rhymeGraph = new RhymeGraph();

window.addEventListener("resize", () => {
  rhymeGraph.resizeCanvas();
});

// Theme
const theme_select = document.getElementById("theme");
theme_select.addEventListener("change", (event) => {
  const theme = event.target.value;
  if (theme == "System") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.dataset.theme = theme;
  }
});

// Filters
const filters = new Set();

// Min Length Filter
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

// Max Length Filter

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

// Textarea and generate button

const textInput = document.getElementById("textInput");
const genButton = document.getElementById("GenerateButton");

genButton.addEventListener("click", async () => {
  let response = await fetch("/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      selected_lang: lang_dropdown.value,
      input_text: textInput.value,
    }),
  });
  let result = await response.json();

  const maxChainLength = Math.max(
    ...result["paths"].map((path) => path.length),
  );
  MinLengthFilter.max = maxChainLength;
  MaxLengthFilter.max = maxChainLength;

  rhymeGraph.inputData(
    result["lexicon"],
    result["word_array"],
    result["paths"],
  );
  rhymeGraph.reset_view();
  rhymeGraph.renderGraph();
});
