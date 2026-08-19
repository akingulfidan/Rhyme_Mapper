import { renderGraph, resizeCanvas, setupCanvas } from "./graph.js";

const superSampleLvl = 2;
const ctx = setupCanvas(superSampleLvl, "2d");

const textInput = document.getElementById("textInput");
const genButton = document.getElementById("GenerateButton");


let lang_response = await fetch("http://localhost:8000/lang");
const languages = await lang_response.json()

const lang_dropdown = document.getElementById("language");


for (const [code, name] of Object.entries(languages)) {
    const option = document.createElement("option");

    option.value = code;
    option.textContent = name;

    lang_dropdown.appendChild(option);
}


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
    console.log(result)

});


window.addEventListener('resize',() => {resizeCanvas(ctx, superSampleLvl); renderGraph(ctx)});




renderGraph(ctx);