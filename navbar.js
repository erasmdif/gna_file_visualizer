(function () {
  function initNavbar() {
    const nav = document.querySelector(".mosi-bottom-nav");
    if (!nav) return;

    const items = nav.querySelectorAll(".mosi-nav-item");
    if (!items.length) return;

    items.forEach((btn) => {
      btn.addEventListener("click", () => {
        const dataset = btn.dataset.dataset;
        if (!dataset) return;

        items.forEach((b) =>
          b.classList.remove("mosi-nav-item-active")
        );
        btn.classList.add("mosi-nav-item-active");

        if (typeof window.setActiveDataset === "function") {
          window.setActiveDataset(dataset);
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavbar);
  } else {
    initNavbar();
  }
})();
