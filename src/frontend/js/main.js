import { RhymeGraph } from "./graph.js";

// Initialize graph canvas

const rhymeGraph = new RhymeGraph(2);

window.addEventListener('resize',() => {rhymeGraph.resizeCanvas(), rhymeGraph.renderGraph()});

// Language list dropdown

let lang_response = await fetch("http://localhost:8000/lang");
const languages = await lang_response.json()

const lang_dropdown = document.getElementById("language");


for (const [code, name] of Object.entries(languages)) {
    const option = document.createElement("option");

    option.value = code;
    option.textContent = name;

    lang_dropdown.appendChild(option);
}

// Textarea and generate button

const textInput = document.getElementById("textInput");
const genButton = document.getElementById("GenerateButton");

genButton.addEventListener('click', async () => {
    let response = await fetch("http://localhost:8000/generate",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                selected_lang: lang_dropdown.value,
                input_text: textInput.value
            })

        }
    );
    let result = await response.json();
    rhymeGraph.inputData(result['lexicon'],result['word_array'],result['paths']);
    rhymeGraph.renderGraph();
});

