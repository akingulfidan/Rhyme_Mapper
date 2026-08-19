import { renderGraph, resizeCanvas, setupCanvas } from "./graph.js";

const superSampleLvl = 2;
const ctx = setupCanvas(superSampleLvl, "2d");

const textInput = document.getElementById("textInput");
const genButton = document.getElementById("GenerateButton");


genButton.addEventListener('click', async () => {
    let response = await fetch("http://localhost:8000/generate",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({input_text: textInput.value})

        }
    );
    
    console.log("request sent");
    let result = await response.json();
    console.log(result)
});


window.addEventListener('resize',() => {resizeCanvas(ctx, superSampleLvl); renderGraph(ctx)});

renderGraph(ctx);