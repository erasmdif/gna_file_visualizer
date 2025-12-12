// utils.js
(function () {
  // ------------------------
  // Utils di base
  // ------------------------

  function normalizeValue(value) {
    if (value === null || value === undefined) return "";
    const str = String(value).trim();
    if (str.toLowerCase() === "null" || str.toLowerCase() === "undefined") {
      return "";
    }
    return str;
  }

  function isEmptyValue(value) {
    const v = normalizeValue(value);
    return v === "";
  }

  function escapeHtml(str) {
    const s = String(str);
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeWithBreaks(str) {
    const v = normalizeValue(str);
    if (v === "") return "";
    return escapeHtml(v).replace(/\n/g, "<br />");
  }

  // ------------------------
  // Campi standard + troncati
  // ------------------------

  function createFieldHTML(label, rawValue) {
    const v = normalizeValue(rawValue);
    const empty = isEmptyValue(v);
    const valueHTML = empty ? escapeHtml("vuoto") : escapeWithBreaks(v);

    return `
      <div class="mosi-field">
        <div class="mosi-field-label">${escapeHtml(label)}</div>
        <div class="mosi-field-value ${empty ? "mosi-empty" : ""}">
          ${valueHTML}
        </div>
      </div>
    `;
  }

  // versione “chiusa di default” con ...leggi tutto
  function createTruncFieldHTML(label, rawValue, maxLength) {
    const v = normalizeValue(rawValue);
    const empty = isEmptyValue(v);
    const limit = maxLength || 500;

    let valueHTML = "";
    if (empty) {
      valueHTML = escapeHtml("vuoto");
    } else if (typeof v === "string" && v.length > limit) {
      const shortText = v.slice(0, limit).trim();
      valueHTML = `
        <span class="mosi-text-short">${escapeWithBreaks(shortText)}…</span>
        <span class="mosi-text-full" style="display:none;">${escapeWithBreaks(
          v
        )}</span>
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

  // ------------------------
  // Sezioni scheda (MOSI / MOPR)
  // ------------------------

  function buildSectionsHTML(props, config) {
    const fieldDefs = config.fieldDefs || {};
    const sectionMap = {};

    // raggruppo i campi per sezione
    Object.keys(fieldDefs).forEach((fieldName) => {
      const def = fieldDefs[fieldName];
      const sectionName = def.section || "Altro";
      if (!sectionMap[sectionName]) sectionMap[sectionName] = [];
      sectionMap[sectionName].push({ fieldName, def });
    });

    const order = config.sectionOrder || Object.keys(sectionMap);
    const used = new Set();
    const orderedSections = [];

    order.forEach((name) => {
      if (sectionMap[name]) {
        orderedSections.push({ name, fields: sectionMap[name] });
        used.add(name);
      }
    });

    // eventuali sezioni non in sectionOrder in coda
    Object.keys(sectionMap).forEach((name) => {
      if (!used.has(name)) {
        orderedSections.push({ name, fields: sectionMap[name] });
      }
    });

    const fullWidthSections = config.fullWidthSections || [];
    let html = "";

    orderedSections.forEach(({ name, fields }) => {
      let fieldsHTML = "";
      let hasAnyNonEmpty = false;

      fields.forEach(({ fieldName, def }) => {
        const label = def.label || fieldName;
        const rawValue = props[fieldName];
        const v = normalizeValue(rawValue);
        const empty = isEmptyValue(v);

        if (!empty) {
          hasAnyNonEmpty = true;
        }

        if (def.truncate) {
          fieldsHTML += createTruncFieldHTML(
            label,
            rawValue,
            def.maxLength || 500
          );
        } else {
          fieldsHTML += createFieldHTML(label, rawValue);
        }
      });

      // se proprio nessun campo ha contenuto, non mostro la sezione
      if (!fieldsHTML || !hasAnyNonEmpty) return;

      const isFullWidth = fullWidthSections.includes(name);
      const safeSectionAttr = name.replace(/"/g, "&quot;");

      html += `
        <section class="mosi-section${
          isFullWidth ? " mosi-section--full" : ""
        }" data-section="${safeSectionAttr}">
          <h2 class="mosi-section-title" data-section="${safeSectionAttr}">
            ${escapeHtml(name)}
          </h2>
          <div class="mosi-fields">
            ${fieldsHTML}
          </div>
        </section>
      `;
    });

    return html;
  }

  // ------------------------
  // Card HTML a schermo
  // ------------------------

  function createCardHTML(feature, config) {
    const props = (feature && feature.properties) || {};
    const headerHTML =
      typeof config.buildHeader === "function"
        ? config.buildHeader(props)
        : "";

    const sectionsHTML = buildSectionsHTML(props, config);
    const key = config.key || "dataset";

    return `
      <article class="mosi-card mosi-card--${escapeHtml(key)}">
        ${headerHTML}
        ${sectionsHTML}
      </article>
    `;
  }

  // ------------------------
  // Card per la stampa
  // ------------------------

  function createPrintCardHTML(feature, config) {
    const props = (feature && feature.properties) || {};
    const headerHTML =
      typeof config.buildPrintHeader === "function"
        ? config.buildPrintHeader(props)
        : "";

    const fieldDefs = config.fieldDefs || {};
    const sectionMap = {};

    Object.keys(fieldDefs).forEach((fieldName) => {
      const def = fieldDefs[fieldName];
      const sectionName = def.section || "Altro";
      if (!sectionMap[sectionName]) sectionMap[sectionName] = [];
      sectionMap[sectionName].push({ fieldName, def });
    });

    const order = config.sectionOrder || Object.keys(sectionMap);
    const used = new Set();
    const orderedSections = [];

    order.forEach((name) => {
      if (sectionMap[name]) {
        orderedSections.push({ name, fields: sectionMap[name] });
        used.add(name);
      }
    });

    Object.keys(sectionMap).forEach((name) => {
      if (!used.has(name)) {
        orderedSections.push({ name, fields: sectionMap[name] });
      }
    });

    function sectionPrintHTML(name, fields) {
      let inner = "";
      let hasAny = false;

      fields.forEach(({ fieldName, def }) => {
        const label = def.label || fieldName;
        const rawValue = props[fieldName];
        const v = normalizeValue(rawValue);
        if (isEmptyValue(v)) return;
        hasAny = true;
        inner += `<p><strong>${escapeHtml(
          label
        )}:</strong> ${escapeWithBreaks(v)}</p>`;
      });

      if (!hasAny) return "";
      return `<h3>${escapeHtml(name)}</h3>${inner}`;
    }

    let bodyHTML = "";
    orderedSections.forEach(({ name, fields }) => {
      bodyHTML += sectionPrintHTML(name, fields);
    });

    return `
      <div class="mosi-print-card">
        ${headerHTML}
        ${bodyHTML}
      </div>
    `;
  }

  // ------------------------
  // Export globale
  // ------------------------

  window.MosiMoprUtils = {
    normalizeValue,
    isEmptyValue,
    escapeHtml,
    escapeWithBreaks,
    createTruncFieldHTML, // usabile anche da altri (es. ricognizioni, se vuoi)
    createCardHTML,
    createPrintCardHTML,
  };
})();
