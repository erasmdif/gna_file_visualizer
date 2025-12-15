(function () {
  const Utils = window.MosiMoprUtils;
  const MapUtils = window.MapUtils;

  const createCardHTML = Utils.createCardHTML;
  const createPrintCardHTML = Utils.createPrintCardHTML;
  const normalizeValue = Utils.normalizeValue;
  const isEmptyValue = Utils.isEmptyValue;
  const escapeHtml = Utils.escapeHtml;
  const escapeWithBreaks = Utils.escapeWithBreaks;

  const DATASET_CONFIGS = {
    mosi: window.MOSI_CONFIG,
    mopr: window.MOPR_CONFIG,
    ricognizioni: window.RICOGNIZIONI_CONFIG,
  };

  const DATA_STATE = {
    mosi: { data: null, currentIndex: null },
    mopr: { data: null, currentIndex: null },
    ricognizioni: { rcg: null, dRcg: null },
    correzioni: { html: null }, // <--- AGGIUNTO
  };

  let activeDatasetKey = "mopr";

  // ------------------------
  // "Leggi tutto"
  // ------------------------

  function initReadMore(root) {
    const container = root || document;
    const buttons = container.querySelectorAll(".mosi-read-more");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const fieldValue = btn.closest(".mosi-field-value");
        if (!fieldValue) return;

        const shortEl = fieldValue.querySelector(".mosi-text-short");
        const fullEl = fieldValue.querySelector(".mosi-text-full");
        if (!fullEl) return;

        const expanded = btn.getAttribute("data-expanded") === "true";

        if (!expanded) {
          // stato iniziale: COLLASSATO → APRO
          fullEl.style.display = "inline";
          if (shortEl) shortEl.style.display = "none";
          btn.textContent = "chiudi";
          btn.setAttribute("data-expanded", "true");
        } else {
          // stato: APERTO → RICHIUDO
          fullEl.style.display = "none";
          if (shortEl) shortEl.style.display = "";
          btn.textContent = "...leggi tutto";
          btn.setAttribute("data-expanded", "false");
        }
      });
    });
  }

  // ------------------------
  // Lista / selezione MOSI / MOPR
  // ------------------------

  function renderRecordList(visibleFeatures, config, datasetKey) {
    const listEl = document.getElementById("record-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    const allFeatures =
      (DATA_STATE[datasetKey].data &&
        DATA_STATE[datasetKey].data.features) ||
      [];

    visibleFeatures.forEach((f) => {
      const props = f.properties || {};
      const originalIndex = allFeatures.indexOf(f);
      if (originalIndex === -1) return;

      const summary = config.buildListItemText(props);

      const item = document.createElement("li");
      item.className = "mosi-record-item";
      item.dataset.index = String(originalIndex);
      item.dataset.dataset = datasetKey;

      item.innerHTML = `
        <div class="mosi-record-title">${summary.title}</div>
        <div class="mosi-record-meta">${summary.meta}</div>
      `;

      item.addEventListener("click", () => {
        selectRecord(datasetKey, originalIndex);
      });

      listEl.appendChild(item);
    });

    const currentIndex = DATA_STATE[datasetKey].currentIndex;
    if (currentIndex != null) {
      const activeEl = listEl.querySelector(
        `.mosi-record-item[data-index="${currentIndex}"]`
      );
      if (activeEl) activeEl.classList.add("active");
    }
  }

  function selectRecord(datasetKey, index) {
    const datasetState = DATA_STATE[datasetKey];
    const config = DATASET_CONFIGS[datasetKey];
    if (!datasetState || !datasetState.data || !config) return;

    const features = datasetState.data.features || [];
    const feature = features[index];
    if (!feature) return;

    datasetState.currentIndex = index;

    document
      .querySelectorAll(".mosi-record-item")
      .forEach((el) => el.classList.remove("active"));
    const listEl = document.getElementById("record-list");
    if (listEl) {
      const activeEl = listEl.querySelector(
        `.mosi-record-item[data-index="${index}"]`
      );
      if (activeEl) activeEl.classList.add("active");
    }

    const cardContainer = document.getElementById("mosi-card");
    if (cardContainer) {
      cardContainer.innerHTML = createCardHTML(feature, config);
      initReadMore(cardContainer);
    }

    if (MapUtils && typeof MapUtils.showFeatureOnMap === "function") {
      MapUtils.showFeatureOnMap(feature);
    }

    const printCurrent = document.getElementById("mosi-print-current");
    if (printCurrent) {
      // reset dei job di stampa
      window.PRINT_MAP_JOBS = [];
      printCurrent.innerHTML = createPrintCardHTML(feature, config);

      if (
        MapUtils &&
        typeof MapUtils.createPrintMap === "function" &&
        window.PRINT_MAP_JOBS &&
        window.PRINT_MAP_JOBS.length
      ) {
        window.PRINT_MAP_JOBS.forEach((job) => {
          MapUtils.createPrintMap(job.mapId, job.feature);
        });
      }
    }
  }

  function setupSearchForDataset(datasetKey) {
    const input = document.getElementById("search-input");
    const datasetState = DATA_STATE[datasetKey];
    const config = DATASET_CONFIGS[datasetKey];
    if (!input || !datasetState || !datasetState.data || !config) return;

    const allFeatures = datasetState.data.features || [];
    input.value = "";

    input.oninput = function () {
      const q = input.value.toLowerCase().trim();
      if (!q) {
        renderRecordList(allFeatures, config, datasetKey);
        return;
      }

      const filtered = allFeatures.filter((f) => {
        const p = f.properties || {};
        const parts = [];
        (config.searchFields || []).forEach((fieldName) => {
          if (p[fieldName] != null) {
            parts.push(p[fieldName].toString().toLowerCase());
          }
        });
        return parts.join(" ").includes(q);
      });

      renderRecordList(filtered, config, datasetKey);
    };
  }

  function renderStandardDatasetView(datasetKey) {
    const datasetState = DATA_STATE[datasetKey];
    const config = DATASET_CONFIGS[datasetKey];
    if (!datasetState || !datasetState.data || !config) return;

    const features = datasetState.data.features || [];
    const cardContainer = document.getElementById("mosi-card");
    const labelEl = document.getElementById("active-dataset-label");
    const sidebarHeader = document.querySelector(".mosi-sidebar-header h2");
    const searchInput = document.getElementById("search-input");

    if (labelEl) {
      labelEl.textContent = "Sezione: " + config.label;
    }
    if (sidebarHeader) {
      sidebarHeader.textContent = "Schedario";
    }
    if (searchInput) {
      searchInput.style.display = "";
      searchInput.placeholder =
        "Cerca per denominazione, comune, definizione…";
    }

    if (!features.length) {
      if (cardContainer) {
        cardContainer.innerHTML =
          '<p class="mosi-empty-state">Nessuna scheda disponibile per questa sezione.</p>';
      }
      const listEl = document.getElementById("record-list");
      if (listEl) listEl.innerHTML = "";
      return;
    }

    setupSearchForDataset(datasetKey);
    renderRecordList(features, config, datasetKey);

    const idx =
      datasetState.currentIndex != null &&
      features[datasetState.currentIndex]
        ? datasetState.currentIndex
        : 0;
    selectRecord(datasetKey, idx);
  }

  // ------------------------
  // RICOGNIZIONI: view e helpers
  // ------------------------

  function buildRcgFieldGrid(fields) {
    const items = fields
      .map(([label, value]) => {
        const v = normalizeValue(value);
        if (isEmptyValue(v)) return "";
        return `
          <div class="mosi-field">
            <div class="mosi-field-label">${escapeHtml(label)}</div>
            <div class="mosi-field-value">${escapeWithBreaks(v)}</div>
          </div>
        `;
      })
      .filter(Boolean)
      .join("");

    if (!items) return "";
    return `<div class="mosi-fields">${items}</div>`;
  }

  function buildRcgMainCardHTML(rcgFeature) {
    const p = rcgFeature.properties || {};

    const denom = normalizeValue(
      p["Denominazione (RCGV)"] || "Ricognizione territoriale"
    );
    const dataR = normalizeValue(p["Data (RCGD) [*]"] || "vuoto");
    const cod = normalizeValue(
      p["Codice identificativo (RCGH) [*]"] || "vuoto"
    );
    const comune = normalizeValue(p["Comune (PVCC) [*]"] || "vuoto");
    const prov = normalizeValue(p["Provincia (PVCP) [*]"] || "vuoto");
    const reg = normalizeValue(p["Regione (PVCR) [*]"] || "vuoto");
    const motivo = normalizeValue(
      p["Motivo della ricognizione (RCGE)"] || "vuoto"
    );
    const metodo = normalizeValue(
      p["Metodo di ricognizione (RCGM)"] || "vuoto"
    );
    const respSci = normalizeValue(
      p["Responsabile scientifico (RCGA)"] || "vuoto"
    );

    const badges = [];

    if (!isEmptyValue(motivo)) {
      badges.push(
        `<span class="mosi-badge">Motivo: ${escapeHtml(motivo)}</span>`
      );
    }
    if (!isEmptyValue(metodo)) {
      badges.push(
        `<span class="mosi-badge mosi-badge-muted">Metodo: ${escapeHtml(
          metodo
        )}</span>`
      );
    }
    if (!isEmptyValue(respSci)) {
      badges.push(
        `<span class="mosi-badge mosi-badge-muted">Resp. scient.: ${escapeHtml(
          respSci
        )}</span>`
      );
    }

    const generalFields = [
      ["Motivo della ricognizione", p["Motivo della ricognizione (RCGE)"]],
      ["Metodo di ricognizione", p["Metodo di ricognizione (RCGM)"]],
      ["Ente finanziatore", p["Ente finanziatore (RCGF)"]],
      ["Ente responsabile", p["Ente responsabile (RCGR)"]],
      ["Responsabile scientifico", p["Responsabile scientifico (RCGA)"]],
      ["Descrizione", p["Descrizione (NSC)"]],
    ];

    const locFields = [
      ["Stato", p.PVCS],
      ["Regione", p["Regione (PVCR) [*]"]],
      ["Provincia", p["Provincia (PVCP) [*]"]],
      ["Comune", p["Comune (PVCC) [*]"]],
      ["Località", p["Località (PVCL)"]],
      ["Indirizzo", p["Indirizzo (PVCI)"]],
      ["Altri percorsi / specifiche", p["Altri percorsi/specifiche (PVCV)"]],
      ["Toponimo / località", p.PVL],
      ["Tipo di contesto", p["Tipo di contesto (PVZ)"]],
    ];

    const geoFields = [
      ["Tipo di localizzazione", p.GEL],
      ["Tipo di georeferenziazione", p.GET],
      ["Sistema di riferimento", p.GEP],
      [
        "Tecnica di georeferenziazione",
        p["Tecnica di georeferenziazione (GPT) [*]"],
      ],
      [
        "Grado di precisione",
        p["Grado di precisione del posizionamento (GPM) [*]"],
      ],
      ["Base cartografica", p["Base cartografica (GPBB) [*]"]],
      ["Note alla georeferenziazione", p["Note alla georeferenziazione (GEN)"]],
    ];

    const catastoFields = [
      ["Comune catastale", p["Comune catastale (CTSC)"]],
      ["Titolo catastale", p.CTST],
      ["Foglio / data", p["Foglio/data (CTSF)"]],
      ["Particelle", p["Particelle (CTSN)"]],
      ["Elementi confinanti", p["Elementi confinanti (CTE)"]],
      ["Note catastali", p["Note (CTN)"]],
    ];

    const compFields = [
      ["Anno di redazione", p["Anno di redazione (CMPD) [*]"]],
      ["Nome del compilatore", p["Nome del compilatore (CMPN) [*]"]],
      [
        "Responsabile verifica scientifica",
        p["Responsabile della verifica scientifica (RSR)"],
      ],
      ["Funzionario responsabile", p["Funzionario responsabile (FUR) [*]"]],
      ["Ente schedatore", p["Ente schedatore (RCGJ) [*]"]],
      ["Codice progetto", p["Codice progetto (CPR_MOPR) [*]"]],
      ["Note", p["Note (OSS)"]],
    ];

    const generalHTML = buildRcgFieldGrid(generalFields);
    const locHTML = buildRcgFieldGrid(locFields);
    const geoHTML = buildRcgFieldGrid(geoFields);
    const catastoHTML = buildRcgFieldGrid(catastoFields);
    const compHTML = buildRcgFieldGrid(compFields);

    return `
      <article class="mosi-card">
        <header class="mosi-card-header">
          <h1 class="mosi-card-title">${escapeHtml(denom)}</h1>
          <p class="mosi-card-subtitle">
            Data: ${escapeHtml(
              dataR
            )} · Codice: ${escapeHtml(cod)} · Comune: ${escapeHtml(
      comune
    )}${
      !isEmptyValue(prov) ? " (Prov. " + escapeHtml(prov) + ")" : ""
    }${!isEmptyValue(reg) ? " – Regione: " + escapeHtml(reg) : ""}
          </p>
          ${
            badges.length
              ? `<div class="mosi-card-badges">${badges.join("")}</div>`
              : ""
          }
        </header>

        ${
          generalHTML
            ? `
          <section class="mosi-section mosi-section--full">
            <h2 class="mosi-section-title">Ricognizione</h2>
            ${generalHTML}
          </section>
        `
            : ""
        }

        ${
          locHTML
            ? `
          <section class="mosi-section">
            <h2 class="mosi-section-title">Localizzazione</h2>
            ${locHTML}
          </section>
        `
            : ""
        }

        ${
          geoHTML
            ? `
          <section class="mosi-section">
            <h2 class="mosi-section-title">Georeferenziazione</h2>
            ${geoHTML}
          </section>
        `
            : ""
        }

        ${
          catastoHTML
            ? `
          <section class="mosi-section">
            <h2 class="mosi-section-title">Catasto</h2>
            ${catastoHTML}
          </section>
        `
            : ""
        }

        ${
          compHTML
            ? `
          <section class="mosi-section">
            <h2 class="mosi-section-title">Compilazione e responsabilità</h2>
            ${compHTML}
          </section>
        `
            : ""
        }
      </article>
    `;
  }

  function createTruncFieldHTML(label, rawValue, maxLength) {
    const v = normalizeValue(rawValue);
    const empty = isEmptyValue(v);

    let valueHTML = "";
    if (empty) {
      valueHTML = escapeHtml("vuoto");
    } else if (typeof v === "string" && v.length > maxLength) {
      const shortText = v.slice(0, maxLength).trim();
      valueHTML = `
        <span class="mosi-text-short">${escapeWithBreaks(shortText)}…</span>
        <span class="mosi-text-full" style="display:none;">${escapeWithBreaks(v)}</span>
        <button
          type="button"
          class="mosi-read-more"
          data-expanded="false"
        >...leggi tutto</button>
      `;
    } else {
      valueHTML = escapeWithBreaks(v);
    }

    return `
      <div class="mosi-field">
        <div class="mosi-field-label">${escapeHtml(label)}</div>
        <div class="mosi-field-value ${empty ? "mosi-empty" : ""}">
          ${valueHTML}
        </div>
      </div>
    `;
  }

  function buildRicUrCardHTML(rcgFeature, urFeature, index) {
    const p = urFeature.properties || {};
    const codice = normalizeValue(
      p["Codice identificativo (RCGY) [*]"] || `U.R. ${index + 1}`
    );
    const dataR = normalizeValue(p["Data (RCGD) [*]"] || "vuoto");
    const visib = normalizeValue(
      p["Visibilità (RCGC) [*]"] || "vuoto"
    );
    const copertura = normalizeValue(
      p["Copertura del suolo (RCGU) [*]"] || "vuoto"
    );

    const specificheField = createTruncFieldHTML(
      "Specifiche copertura del suolo",
      p["Specifiche relative alla copertura del suolo (RCGZ)"],
      350
    );
    const geomorfField = createTruncFieldHTML(
      "Sintesi geomorfologica / geopedologica",
      p["Sintesi geomorfologica/ geopedologica (RCGT)"],
      350
    );
    const noteField = createTruncFieldHTML(
      "Note",
      p["Note (CTN)"],
      300
    );

    const mapId = `ric-ur-map-${index}`;

    return `
      <article class="ric-ur-card">
        <header class="ric-ur-card-header">
          <h3 class="ric-ur-card-title">${escapeHtml(codice)}</h3>
          <p class="ric-ur-card-meta">
            Data: ${escapeHtml(dataR)} · Visibilità: ${escapeHtml(
      visib
    )} · Copertura: ${escapeHtml(copertura)}
          </p>
        </header>
        <div id="${mapId}" class="ric-ur-map"></div>
        <div class="ric-ur-card-body">
          ${specificheField}
          ${geomorfField}
          ${noteField}
        </div>
      </article>
    `;
  }

  function buildRicUrGridHTML(rcgFeature, urFeatures) {
    if (!urFeatures || !urFeatures.length) return "";

    const sorted = [...urFeatures].sort((a, b) => {
      const pa = a.properties || {};
      const pb = b.properties || {};
      const ca = normalizeValue(
        pa["Codice identificativo (RCGY) [*]"] || ""
      );
      const cb = normalizeValue(
        pb["Codice identificativo (RCGY) [*]"] || ""
      );
      return ca.localeCompare(cb, "it", { numeric: true });
    });

    const cardsHTML = sorted
      .map((f, idx) => buildRicUrCardHTML(rcgFeature, f, idx))
      .join("");

    return `
      <section class="ric-ur-section">
        <h2 class="mosi-section-title">Unità di ricognizione</h2>
        <div class="ric-ur-grid">
          ${cardsHTML}
        </div>
      </section>
    `;
  }

  function initRicognizioniMiniMaps(rcgFeature, urFeatures) {
    if (!MapUtils || typeof MapUtils.createMiniMap !== "function") return;
    if (!urFeatures) return;

    urFeatures.forEach((ur, idx) => {
      const mapId = `ric-ur-map-${idx}`;
      MapUtils.createMiniMap(mapId, rcgFeature, ur);
    });
  }

  function renderRicognizioniView() {
    const rcgState = DATA_STATE.ricognizioni;
    const labelEl = document.getElementById("active-dataset-label");
    const sidebarHeader = document.querySelector(".mosi-sidebar-header h2");
    const searchInput = document.getElementById("search-input");
    const listEl = document.getElementById("record-list");
    const cardContainer = document.getElementById("mosi-card");

    if (labelEl) {
      labelEl.textContent = "Sezione: Ricognizioni";
    }
    if (sidebarHeader) {
      sidebarHeader.textContent = "Ricognizione";
    }
    if (searchInput) {
      searchInput.style.display = "none";
      searchInput.oninput = null;
    }
    if (listEl) {
      listEl.innerHTML = "";
    }

    if (
      !rcgState ||
      !rcgState.rcg ||
      !rcgState.rcg.features ||
      !rcgState.rcg.features.length
    ) {
      if (cardContainer) {
        cardContainer.innerHTML =
          '<p class="mosi-empty-state">Nessuna ricognizione disponibile.</p>';
      }
      return;
    }

    const rcgFeature = rcgState.rcg.features[0];
    const urFeatures =
      (rcgState.dRcg && rcgState.dRcg.features) || [];

    if (listEl) {
      const p = rcgFeature.properties || {};
      const dataR = normalizeValue(p["Data (RCGD) [*]"] || "vuoto");
      const cod = normalizeValue(
        p["Codice identificativo (RCGH) [*]"] || "vuoto"
      );

      const li = document.createElement("li");
      li.className = "mosi-record-item mosi-record-item-static";
      li.innerHTML = `
        <div class="mosi-record-title">Processo di ricognizione</div>
        <div class="mosi-record-meta">Data: ${escapeHtml(
          dataR
        )} · Codice: ${escapeHtml(cod)}</div>
      `;
      listEl.appendChild(li);
    }

    if (cardContainer) {
      const mainHTML = buildRcgMainCardHTML(rcgFeature);
      const urGridHTML = buildRicUrGridHTML(rcgFeature, urFeatures);
      cardContainer.innerHTML = mainHTML + urGridHTML;
      initReadMore(cardContainer);
    }

    if (MapUtils && typeof MapUtils.showFeatureOnMap === "function") {
      MapUtils.showFeatureOnMap(rcgFeature);
    }

    initRicognizioniMiniMaps(rcgFeature, urFeatures);
    updateRicognizioniPrintCurrent();
  }

  // ------------------------
  // PRINT: Ricognizioni
  // ------------------------

  function buildRcgPrintHTML(rcgFeature) {
    const p = rcgFeature.properties || {};
    const denom = normalizeValue(
      p["Denominazione (RCGV)"] || "Ricognizione territoriale"
    );
    const dataR = normalizeValue(p["Data (RCGD) [*]"] || "vuoto");
    const cod = normalizeValue(
      p["Codice identificativo (RCGH) [*]"] || "vuoto"
    );
    const comune = normalizeValue(p["Comune (PVCC) [*]"] || "vuoto");
    const prov = normalizeValue(p["Provincia (PVCP) [*]"] || "vuoto");
    const reg = normalizeValue(p["Regione (PVCR) [*]"] || "vuoto");

    const generalFields = [
      ["Motivo della ricognizione", p["Motivo della ricognizione (RCGE)"]],
      ["Metodo di ricognizione", p["Metodo di ricognizione (RCGM)"]],
      ["Ente finanziatore", p["Ente finanziatore (RCGF)"]],
      ["Ente responsabile", p["Ente responsabile (RCGR)"]],
      ["Responsabile scientifico", p["Responsabile scientifico (RCGA)"]],
      ["Descrizione", p["Descrizione (NSC)"]],
    ];

    const locFields = [
      ["Stato", p.PVCS],
      ["Regione", p["Regione (PVCR) [*]"]],
      ["Provincia", p["Provincia (PVCP) [*]"]],
      ["Comune", p["Comune (PVCC) [*]"]],
      ["Località", p["Località (PVCL)"]],
      ["Indirizzo", p["Indirizzo (PVCI)"]],
      ["Altri percorsi / specifiche", p["Altri percorsi/specifiche (PVCV)"]],
      ["Toponimo / località", p.PVL],
      ["Tipo di contesto", p["Tipo di contesto (PVZ)"]],
    ];

    const geoFields = [
      ["Tipo di localizzazione", p.GEL],
      ["Tipo di georeferenziazione", p.GET],
      ["Sistema di riferimento", p.GEP],
      [
        "Tecnica di georeferenziazione",
        p["Tecnica di georeferenziazione (GPT) [*]"],
      ],
      [
        "Grado di precisione",
        p["Grado di precisione del posizionamento (GPM) [*]"],
      ],
      ["Base cartografica", p["Base cartografica (GPBB) [*]"]],
      ["Note alla georeferenziazione", p["Note alla georeferenziazione (GEN)"]],
    ];

    const catastoFields = [
      ["Comune catastale", p["Comune catastale (CTSC)"]],
      ["Titolo catastale", p.CTST],
      ["Foglio / data", p["Foglio/data (CTSF)"]],
      ["Particelle", p["Particelle (CTSN)"]],
      ["Elementi confinanti", p["Elementi confinanti (CTE)"]],
      ["Note catastali", p["Note (CTN)"]],
    ];

    const compFields = [
      ["Anno di redazione", p["Anno di redazione (CMPD) [*]"]],
      ["Nome del compilatore", p["Nome del compilatore (CMPN) [*]"]],
      [
        "Responsabile verifica scientifica",
        p["Responsabile della verifica scientifica (RSR)"],
      ],
      ["Funzionario responsabile", p["Funzionario responsabile (FUR) [*]"]],
      ["Ente schedatore", p["Ente schedatore (RCGJ) [*]"]],
      ["Codice progetto", p["Codice progetto (CPR_MOPR) [*]"]],
      ["Note", p["Note (OSS)"]],
    ];

    function printFields(title, fields) {
      const rows = fields
        .map(([label, val]) => {
          const v = normalizeValue(val);
          if (isEmptyValue(v)) return "";
          return `<p><strong>${escapeHtml(label)}:</strong> ${escapeWithBreaks(
            v
          )}</p>`;
        })
        .filter(Boolean)
        .join("");
      if (!rows) return "";
      return `<h3>${escapeHtml(title)}</h3>${rows}`;
    }

    return `
      <div class="mosi-print-card">
        <h1>${escapeHtml(denom)}</h1>
        <p>
          Data: ${escapeHtml(dataR)} · Codice: ${escapeHtml(
      cod
    )} · Comune: ${escapeHtml(comune)}${
      !isEmptyValue(prov) ? " (Prov. " + escapeHtml(prov) + ")" : ""
    }${!isEmptyValue(reg) ? " – Regione: " + escapeHtml(reg) : ""}
        </p>
        ${printFields("Ricognizione", generalFields)}
        ${printFields("Localizzazione", locFields)}
        ${printFields("Georeferenziazione", geoFields)}
        ${printFields("Catasto", catastoFields)}
        ${printFields("Compilazione e responsabilità", compFields)}
      </div>
    `;
  }

  function buildRicUrPrintHTML(urFeature) {
    const p = urFeature.properties || {};
    const codice = normalizeValue(
      p["Codice identificativo (RCGY) [*]"] || "Unità di ricognizione"
    );
    const dataR = normalizeValue(p["Data (RCGD) [*]"] || "vuoto");
    const visib = normalizeValue(
      p["Visibilità (RCGC) [*]"] || "vuoto"
    );
    const copertura = normalizeValue(
      p["Copertura del suolo (RCGU) [*]"] || "vuoto"
    );

    const fields = [
      [
        "Specifiche copertura del suolo",
        p["Specifiche relative alla copertura del suolo (RCGZ)"],
      ],
      [
        "Sintesi geomorfologica / geopedologica",
        p["Sintesi geomorfologica/ geopedologica (RCGT)"],
      ],
      ["Note", p["Note (CTN)"]],
    ];

    const rows = fields
      .map(([label, val]) => {
        const v = normalizeValue(val);
        if (isEmptyValue(v)) return "";
        return `<p><strong>${escapeHtml(label)}:</strong> ${escapeWithBreaks(
          v
        )}</p>`;
      })
      .filter(Boolean)
      .join("");

    return `
      <div class="mosi-print-card">
        <h2>${escapeHtml(codice)}</h2>
        <p>
          Data: ${escapeHtml(dataR)} · Visibilità: ${escapeHtml(
      visib
    )} · Copertura: ${escapeHtml(copertura)}
        </p>
        ${rows}
      </div>
    `;
  }

  function updateRicognizioniPrintCurrent() {
    const printCurrent = document.getElementById("mosi-print-current");
    if (!printCurrent) return;

    const rcgState = DATA_STATE.ricognizioni;
    if (
      !rcgState ||
      !rcgState.rcg ||
      !rcgState.rcg.features ||
      !rcgState.rcg.features.length
    ) {
      printCurrent.innerHTML = "";
      return;
    }

    const rcgFeature = rcgState.rcg.features[0];
    const urFeatures =
      (rcgState.dRcg && rcgState.dRcg.features) || [];

    let html = buildRcgPrintHTML(rcgFeature);
    if (urFeatures.length) {
      html += `<h2>Unità di ricognizione</h2>`;
      html += urFeatures.map(buildRicUrPrintHTML).join("");
    }

    printCurrent.innerHTML = html;
  }

  // ------------------------
  // PRINT: generale
  // ------------------------

  function buildPrintAll() {
    const container = document.getElementById("mosi-print-all");
    if (!container) return;

    const parts = [];
    window.PRINT_MAP_JOBS = [];

    // MOSI
    const mosiState = DATA_STATE.mosi;
    const mosiCfg = DATASET_CONFIGS.mosi;
    if (mosiState.data && mosiState.data.features && mosiCfg) {
      mosiState.data.features.forEach((f) => {
        parts.push(createPrintCardHTML(f, mosiCfg));
      });
    }

    // MOPR
    const moprState = DATA_STATE.mopr;
    const moprCfg = DATASET_CONFIGS.mopr;
    if (moprState.data && moprState.data.features && moprCfg) {
      moprState.data.features.forEach((f) => {
        parts.push(createPrintCardHTML(f, moprCfg));
      });
    }

    // Ricognizioni (come prima)
    const ricState = DATA_STATE.ricognizioni;
    if (
      ricState.rcg &&
      ricState.rcg.features &&
      ricState.rcg.features.length
    ) {
      const rcgFeature = ricState.rcg.features[0];
      parts.push(buildRcgPrintHTML(rcgFeature));

      const urFeatures =
        (ricState.dRcg && ricState.dRcg.features) || [];
      if (urFeatures.length) {
        parts.push("<h2>Unità di ricognizione</h2>");
        parts.push(urFeatures.map(buildRicUrPrintHTML).join(""));
      }
    }

    container.innerHTML = parts.join("");

    if (
      MapUtils &&
      typeof MapUtils.createPrintMap === "function" &&
      window.PRINT_MAP_JOBS &&
      window.PRINT_MAP_JOBS.length
    ) {
      window.PRINT_MAP_JOBS.forEach((job) => {
        MapUtils.createPrintMap(job.mapId, job.feature);
      });
    }
  }

  function setupPrintButtons() {
    const printAllBtn = document.getElementById("print-all-btn");
    const printCurrentBtn = document.getElementById("print-current-btn");

    if (printAllBtn) {
      printAllBtn.addEventListener("click", () => {
        buildPrintAll();
        document.body.classList.remove("print-mode-current");
        document.body.classList.add("print-mode-all");

        setTimeout(() => {
          window.print();
          document.body.classList.remove("print-mode-all");
        }, 500);
      });
    }

    if (printCurrentBtn) {
      printCurrentBtn.addEventListener("click", () => {
        if (activeDatasetKey === "ricognizioni") {
          updateRicognizioniPrintCurrent();
        }
        document.body.classList.remove("print-mode-all");
        document.body.classList.add("print-mode-current");

        setTimeout(() => {
          window.print();
          document.body.classList.remove("print-mode-current");
        }, 500);
      });
    }
  }

    // ------------------------
  // CORREZIONI: view semplice da HTML statico
  // ------------------------

  function renderCorrezioniView() {
    const labelEl = document.getElementById("active-dataset-label");
    const sidebarHeader = document.querySelector(".mosi-sidebar-header h2");
    const searchInput = document.getElementById("search-input");
    const listEl = document.getElementById("record-list");
    const cardContainer = document.getElementById("mosi-card");

    if (labelEl) {
      labelEl.textContent = "Sezione: Dettagli su correzioni";
    }
    if (sidebarHeader) {
      sidebarHeader.textContent = "Note e controlli";
    }
    if (searchInput) {
      searchInput.style.display = "none";
      searchInput.value = "";
      searchInput.oninput = null;
    }
    if (listEl) {
      listEl.innerHTML = "";
    }

    if (!cardContainer) return;

    const html =
      DATA_STATE.correzioni && DATA_STATE.correzioni.html
        ? DATA_STATE.correzioni.html.trim()
        : "";

    if (html) {
      cardContainer.innerHTML = html;
    } else {
      cardContainer.innerHTML =
        '<p class="mosi-empty-state">Impossibile caricare le note sulle correzioni.</p>';
    }
  }

  // ------------------------
  // SWITCH DATASET
  // ------------------------

  function renderDatasetView(datasetKey) {
    if (datasetKey === "ricognizioni") {
      renderRicognizioniView();
    } else {
      renderStandardDatasetView(datasetKey);
    }
  }

  function setActiveDataset(key) {
    if (!DATASET_CONFIGS[key]) return;
    activeDatasetKey = key;
    renderDatasetView(key);
  }

  // serve all'esportazione DOCX
  function getCurrentRecordData() {
    if (activeDatasetKey === "ricognizioni") {
      const rcgState = DATA_STATE.ricognizioni;
      if (
        !rcgState ||
        !rcgState.rcg ||
        !rcgState.rcg.features ||
        !rcgState.rcg.features.length
      ) {
        return null;
      }
      // per ora non usiamo config per le ricognizioni in DOCX
      return {
        datasetKey: "ricognizioni",
        feature: rcgState.rcg.features[0],
        config: null,
      };
    }

    const datasetState = DATA_STATE[activeDatasetKey];
    const config = DATASET_CONFIGS[activeDatasetKey];
    if (!datasetState || !datasetState.data || !config) return null;

    const features = datasetState.data.features || [];
    const idx =
      datasetState.currentIndex != null &&
      features[datasetState.currentIndex]
        ? datasetState.currentIndex
        : 0;
    const feature = features[idx];
    if (!feature) return null;

    return {
      datasetKey: activeDatasetKey,
      feature: feature,
      config: config,
    };
  }

  // esposto per navbar.js e per export_docx.js
  function getCurrentRecordForExport() {
    const config = DATASET_CONFIGS[activeDatasetKey];
    const state = DATA_STATE[activeDatasetKey];
    if (!config || !state) return null;

    if (activeDatasetKey === "ricognizioni") {
      const rcgFeature =
        state.ricognizioni &&
        state.ricognizioni.rcg &&
        state.ricognizioni.rcg.features &&
        state.ricognizioni.rcg.features[0];
      if (!rcgFeature) return null;
      return {
        datasetKey: "ricognizioni",
        feature: rcgFeature,
        config,
      };
    }

    const data = state.data;
    if (
      !data ||
      !data.features ||
      state.currentIndex == null ||
      !data.features[state.currentIndex]
    ) {
      return null;
    }

    return {
      datasetKey: activeDatasetKey,
      feature: data.features[state.currentIndex],
      config,
    };
  }

  // esposto per navbar.js e export_docx.js
  window.setActiveDataset = setActiveDataset;
  window.getCurrentRecordForExport = getCurrentRecordForExport;
  window.getCurrentRecordData = getCurrentRecordData;

  // ------------------------
  // INIT
  // ------------------------

  function loadGeoJSON(url) {
    if (!url) return Promise.resolve(null);
    return fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Errore caricamento " + url);
        return res.json();
      })
      .catch(() => null);
  }

  function initApp() {
    if (MapUtils && typeof MapUtils.initMap === "function") {
      MapUtils.initMap();
    }

    const mosiCfg = DATASET_CONFIGS.mosi;
    const moprCfg = DATASET_CONFIGS.mopr;
    const ricCfg = DATASET_CONFIGS.ricognizioni;

    const promises = [
      // MOSI
      loadGeoJSON(mosiCfg && mosiCfg.geojsonUrl).then((data) => {
        if (data) DATA_STATE.mosi.data = data;
      }),

      // MOPR
      loadGeoJSON(moprCfg && moprCfg.geojsonUrl).then((data) => {
        if (data) DATA_STATE.mopr.data = data;
      }),

      // Ricognizioni (rcg + d_rcg)
      loadGeoJSON(ricCfg && ricCfg.rcgUrl).then((data) => {
        if (data) DATA_STATE.ricognizioni.rcg = data;
      }),
      loadGeoJSON(ricCfg && ricCfg.dRcgUrl).then((data) => {
        if (data) DATA_STATE.ricognizioni.dRcg = data;
      }),

      // NUOVO: pagina "correzioni" caricata da /data/correzioni.html
      fetch("data/correzioni.html")
        .then((res) => (res.ok ? res.text() : ""))
        .then((html) => {
          DATA_STATE.correzioni.html = html || "";
        })
        .catch(() => {
          DATA_STATE.correzioni.html = "";
        }),
    ];

    Promise.all(promises).then(() => {
      renderDatasetView(activeDatasetKey);
    });

    setupPrintButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
