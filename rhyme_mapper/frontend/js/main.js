import { RhymeGraph } from "./graph.js";

// Get version
const version_response = await fetch("/version");
const version = await version_response.json();
console.log(version);

// Tabs
const tabs = document.querySelectorAll(".TabButton");
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target_tab = document.getElementById(tab.dataset.tab);
    document.querySelectorAll(".TabContent").forEach(tab_content => {tab_content.hidden=true;});
    target_tab.hidden = false;
  })
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

const rhymeGraph = new RhymeGraph(2);
const styles = getComputedStyle(document.documentElement);
rhymeGraph.setColors({
  background: styles.getPropertyValue("--background").trim(),
  rhyme_path: styles.getPropertyValue("--rhyme_path_color").trim(),
  phoneme: styles.getPropertyValue("--phoneme_color").trim()
})
window.addEventListener("resize", () => {
  (rhymeGraph.resizeCanvas(), rhymeGraph.renderGraph());
});

// Theme
const theme_select = document.getElementById("theme");
theme_select.addEventListener("change", (event) => {
  const theme = event.target.value;
  if (theme=="System"){
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.dataset.theme = theme;
  }
})
const theme_observer = new MutationObserver((mutationList) =>{
  for (const mutation of mutationList){
    if (mutation.attributeName == "data-theme"){
      const styles = getComputedStyle(document.documentElement);
      rhymeGraph.setColors({
        background: styles.getPropertyValue("--background").trim(),
        rhyme_path: styles.getPropertyValue("--rhyme_path_color").trim(),
        phoneme: styles.getPropertyValue("--phoneme_color").trim()
      }
      )
      rhymeGraph.renderGraph();
    }
  }
})
theme_observer.observe(document.documentElement,{attributes: true});

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
  
  rhymeGraph.reset_view();
  rhymeGraph.renderGraph();
});
