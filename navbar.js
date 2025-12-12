// file: navbar.js
(function () {
  const mapWrapper = document.querySelector(".mosi-map-wrapper");
  const sidebarHeaderTitle = document.querySelector(".mosi-sidebar-header h2");
  const searchInput = document.getElementById("search-input");
  const recordList = document.getElementById("record-list");
  const cardContainer = document.getElementById("mosi-card");
  const activeDatasetLabel = document.getElementById("active-dataset-label");

  let correzioniHTMLCache = null;

  let tavoleDataCache = null;
  let tavoleCurrentIndex = 0;

  // ----------------------------
  // HELPERS UI
  // ----------------------------

  function setActiveNav(btn) {
    document
      .querySelectorAll(".mosi-nav-item")
      .forEach((el) => el.classList.remove("mosi-nav-item-active"));
    btn.classList.add("mosi-nav-item-active");
  }

  function showMapWrapper() {
    if (mapWrapper) mapWrapper.style.display = "";
  }

  function hideMapWrapper() {
    if (mapWrapper) mapWrapper.style.display = "none";
  }

  function resetSidebarForDataset() {
    if (sidebarHeaderTitle) sidebarHeaderTitle.textContent = "Schedario";
    if (searchInput) {
      searchInput.style.display = "";
      searchInput.disabled = false;
    }
  }

  function clearSidebarForStaticPage(title) {
    if (sidebarHeaderTitle) sidebarHeaderTitle.textContent = title;
    if (searchInput) {
      searchInput.style.display = "none";
      searchInput.value = "";
    }
    if (recordList) recordList.innerHTML = "";
  }

  // ----------------------------
  // DATASET VIEW (MOSI / MOPR / RICOGNIZIONI)
  // ----------------------------

  function showDataset(datasetKey) {
    showMapWrapper();
    resetSidebarForDataset();
    if (activeDatasetLabel) {
      const label =
        datasetKey === "mosi"
          ? "MOSI"
          : datasetKey === "mopr"
          ? "MOPR"
          : "Ricognizioni";
      activeDatasetLabel.textContent = "Sezione: " + label;
    }

    if (typeof window.setActiveDataset === "function") {
      window.setActiveDataset(datasetKey);
    }
  }

  // ----------------------------
  // CORREZIONI
  // ----------------------------

  function showCorrezioni() {
    hideMapWrapper();
    clearSidebarForStaticPage("Dettagli su correzioni");

    if (activeDatasetLabel) {
      activeDatasetLabel.textContent = "Sezione: Dettagli su correzioni";
    }

    if (!cardContainer) return;

    if (correzioniHTMLCache) {
      cardContainer.innerHTML = correzioniHTMLCache;
      return;
    }

    fetch("data/correzioni.html")
      .then((res) => res.text())
      .then((html) => {
        correzioniHTMLCache = html;
        cardContainer.innerHTML = html;
      })
      .catch(() => {
        cardContainer.innerHTML =
          '<p class="mosi-empty-state">Impossibile caricare le note di correzione.</p>';
      });
  }

  // ----------------------------
  // TAVOLE (PDF)
  // ----------------------------

  function loadTavoleData() {
    if (tavoleDataCache) {
      return Promise.resolve(tavoleDataCache);
    }
    return fetch("data/tavole/tavole.json")
      .then((res) => {
        if (!res.ok) throw new Error("Errore caricamento tavole.json");
        return res.json();
      })
      .then((json) => {
        if (!Array.isArray(json)) {
          throw new Error("Formato tavole.json non valido (deve essere un array)");
        }
        tavoleDataCache = json;
        tavoleCurrentIndex = 0;
        return tavoleDataCache;
      });
  }

  function renderTavoleSidebar() {
    if (!recordList || !tavoleDataCache) return;

    recordList.innerHTML = "";

    tavoleDataCache.forEach((t, idx) => {
      const li = document.createElement("li");
      li.className =
        "mosi-record-item" + (idx === tavoleCurrentIndex ? " active" : "");
      li.dataset.index = String(idx);

      const title = t.title || "Tavola " + (idx + 1);
      const subtitle = t.subtitle || "";

      li.innerHTML = `
        <div class="mosi-record-title">${title}</div>
        <div class="mosi-record-meta">${subtitle}</div>
      `;

      li.addEventListener("click", () => {
        tavoleCurrentIndex = idx;
        renderTavola();
        renderTavoleSidebar(); // per aggiornare lo stato "active"
      });

      recordList.appendChild(li);
    });
  }

  function renderTavola() {
    if (!cardContainer || !tavoleDataCache || !tavoleDataCache.length) return;

    const item =
      tavoleDataCache[tavoleCurrentIndex] || tavoleDataCache[0];

    const file = item.file;
    const title =
      item.title || "Tavola " + (tavoleCurrentIndex + 1);
    const subtitle = item.subtitle || "";
    const description = item.description || "";

    if (!file) {
      cardContainer.innerHTML =
        '<p class="mosi-empty-state">File PDF non specificato per questa tavola.</p>';
      return;
    }

    const pdfUrl = "data/tavole/" + encodeURIComponent(file);

    cardContainer.innerHTML = `
      <article class="mosi-card tavole-card">
        <header class="mosi-card-header">
          <h1 class="mosi-card-title">${title}</h1>
          ${
            subtitle
              ? `<p class="mosi-card-subtitle">${subtitle}</p>`
              : ""
          }
        </header>

        ${
          description
            ? `
          <section class="mosi-section tavole-description">
            <p>${description}</p>
          </section>
        `
            : ""
        }

        <section class="mosi-section tavole-viewer-section">
          <div class="tavole-viewer-note">
            Puoi scorrere e zoomare la tavola direttamente qui sotto.
            Per una migliore leggibilità su A3 è consigliabile scaricare il PDF.
          </div>

          <div class="tavole-viewer">
            <iframe
              src="${pdfUrl}#view=FitH"
              class="tavole-iframe"
              title="${title}"
            ></iframe>
          </div>

          <div class="tavole-actions">
            <a href="${pdfUrl}" download class="mosi-btn mosi-btn-primary">
              <i class="bi bi-download"></i>
              <span>Scarica PDF</span>
            </a>
            <a href="${pdfUrl}" target="_blank" rel="noopener noreferrer" class="mosi-btn mosi-btn-secondary">
              <i class="bi bi-box-arrow-up-right"></i>
              <span>Apri in nuova scheda</span>
            </a>
          </div>
        </section>
      </article>
    `;
  }

  function showTavole() {
    hideMapWrapper();
    clearSidebarForStaticPage("Tavole A3");

    if (activeDatasetLabel) {
      activeDatasetLabel.textContent = "Sezione: Tavole";
    }

    if (cardContainer) {
      cardContainer.innerHTML =
        '<p class="mosi-empty-state">Caricamento tavole in corso…</p>';
    }

    loadTavoleData()
      .then(() => {
        if (!tavoleDataCache || !tavoleDataCache.length) {
          if (cardContainer) {
            cardContainer.innerHTML =
              '<p class="mosi-empty-state">Nessuna tavola disponibile.</p>';
          }
          return;
        }
        renderTavoleSidebar();
        renderTavola();
      })
      .catch(() => {
        if (cardContainer) {
          cardContainer.innerHTML =
            '<p class="mosi-empty-state">Impossibile caricare le tavole (tavole.json).</p>';
        }
      });
  }

  // ----------------------------
  // NAVBAR HANDLER
  // ----------------------------

  function handleNavClick(btn) {
    setActiveNav(btn);

    const dataset = btn.getAttribute("data-dataset");
    const page = btn.getAttribute("data-page");

    if (dataset) {
      showDataset(dataset);
      return;
    }

    if (page === "correzioni") {
      showCorrezioni();
      return;
    }

    if (page === "tavole") {
      showTavole();
      return;
    }
  }

  function initNavbar() {
    const buttons = document.querySelectorAll(".mosi-nav-item");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => handleNavClick(btn));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavbar);
  } else {
    initNavbar();
  }

  // Esponiamo per eventuale uso da console
  window.showCorrezioni = showCorrezioni;
  window.showTavole = showTavole;
})();
