export function init_tabs() { 
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
}

