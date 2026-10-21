export function init_settings() {
  init_theme_select();
}

// Theme

function init_theme_select() {
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
