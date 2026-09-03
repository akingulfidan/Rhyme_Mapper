import { RhymeGraph } from "./graph.js";

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

const rhymeGraph = new RhymeGraph(2);

window.addEventListener("resize", () => {
  (rhymeGraph.resizeCanvas(), rhymeGraph.renderGraph());
});

// Chain length filter

const chainLengthFilter = document.getElementById("chainLength");
const chainLengthFilterLabel = document.getElementById(
  "chainLengthFilterValue",
);

chainLengthFilter.addEventListener("input", () => {
  const value = chainLengthFilter.value;

  chainLengthFilterLabel.textContent = value;
  const filtered_paths = rhymeGraph.all_rhyme_paths.filter(
    (path) => path.length >= value,
  );

  rhymeGraph.rhyme_paths = filtered_paths;
  rhymeGraph.renderGraph();
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
  chainLengthFilter.max = maxChainLength;

  rhymeGraph.inputData(
    result["lexicon"],
    result["word_array"],
    result["paths"],
  );

  rhymeGraph.renderGraph();
});
