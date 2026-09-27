export async function init_input(rhymeGraph) {
  const lang_dropdown = await init_language_select();
  init_text_input(rhymeGraph, lang_dropdown);
}

// Language list dropdown
async function init_language_select() {
  let lang_response = await fetch("/lang");
  const languages = await lang_response.json();

  const lang_dropdown = document.getElementById("language");

  for (const [code, name] of Object.entries(languages)) {
    const option = document.createElement("option");

    option.value = code;
    option.textContent = name;

    lang_dropdown.appendChild(option);
  }

  return lang_dropdown;
}

// Textarea and generate button
function init_text_input(rhymeGraph, lang_dropdown) {
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

    rhymeGraph.inputData(
      result["lexicon"],
      result["word_array"],
      result["paths"],
    );
  });
}
