export function init_tabs() { 
  const tabs = document.querySelectorAll(".TabButton");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target_tab = document.getElementById(tab.dataset.tab);
      document.querySelectorAll(".TabButton").forEach((tab_button) => {
        tab_button.setAttribute("aria-selected", "false");
      })
      document.querySelectorAll(".TabContent").forEach((tab_content) => {
        tab_content.hidden = true;
      });
      tab.setAttribute("aria-selected", "true");
      target_tab.hidden = false;
    });
  });
}

