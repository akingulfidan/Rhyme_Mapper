/*
Module for functionality related to settings of the webui.

Code for Rhyme Mapper is refactored into modules which then expose select functionality to main.js via an exported init function.
*/

export function init_settings() {
  init_theme_select();
}

function init_theme_select() {
  // Attaches listener to select element for themes. On change assigns the selected theme to the document as a data attribute. Which determines which css variables are used for colors.
  
  const theme_select = document.getElementById("theme");

  theme_select.addEventListener("change", (event) => {
    const theme = event.target.value;
    if (theme == "System") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.dataset.theme = theme;
    }
  });
}
