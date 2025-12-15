(function () {
  // --------- Utility base ---------

  function normalizeValue(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed === "" ? "" : trimmed;
    }
    if (typeof value === "number") {
      return Number.isFinite(value) ? String(value) : "";
    }
    return String(value);
  }

  function isEmptyValue(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim() === "";
    return false;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeWithBreaks(value) {
    const v = normalizeValue(value);
    if (isEmptyValue(v)) return "";
    return escapeHtml(String(v)).replace(/\r?\n/g, "<br />");
  }

  // --------- Geometria (per export) ---------

  function summarizeGeometry(feature) {
    if (!feature || !feature.geometry) return null;
    const geom = feature.geometry;
    const type = geom.type || "n/d";
    const coords = [];

    function collect(c) {
      if (!c) return;
      if (typeof c[0] === "number" && typeof c[1] === "number") {
        coords.push(c);
      } else if (Array.isArray(c)) {
        c.forEach(collect);
      }
    }

    collect(geom.coordinates);

    if (!coords.length) {
      return { type, points: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    coords.forEach(function (pt) {
      const x = pt[0];
      const y = pt[1];
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    });

    const centerLng = (minX + maxX) / 2;
    const centerLat = (minY + maxY) / 2;

    return {
      type: type,
      bbox: [minX, minY, maxX, maxY],
      center: [centerLng, centerLat],
      points: coords.length,
    };
  }

  // --------- Costruzione sezioni / campi ---------

  function groupFieldsBySection(props, config) {
    const fieldDefs = (config && config.fieldDefs) || {};
    const sections = {};

    Object.keys(fieldDefs).forEach(function (fieldName) {
      const def = fieldDefs[fieldName] || {};
      const raw = props[fieldName];
      const v = normalizeValue(raw);
      if (isEmptyValue(v)) return;
      const sectionName = def.section || "Altri campi";

      if (!sections[sectionName]) {
        sections[sectionName] = [];
      }
      sections[sectionName].push({
        fieldName: fieldName,
        label: def.label || fieldName,
        value: v,
        def: def,
      });
    });

    return sections;
  }

  function getOrderedSectionNames(sections, config) {
    const order = (config && config.sectionOrder) || [];
    const inSections = Object.keys(sections);

    const result = [];

    order.forEach(function (name) {
      if (sections[name]) result.push(name);
    });

    inSections
      .filter(function (name) {
        return order.indexOf(name) === -1;
      })
      .sort()
      .forEach(function (name) {
        result.push(name);
      });

    return result;
  }

  function buildFieldHTML(label, value, def, options) {
    const opts = options || {};
    const forPrint = !!opts.forPrint;
    const norm = normalizeValue(value);
    const empty = isEmptyValue(norm);
    const isLong = def && def.truncate;
    var valueHtml = "";

    if (empty) {
      valueHtml = escapeHtml("vuoto");
    } else {
      const str = String(norm);
      if (!forPrint && def && def.truncate && def.maxLength && str.length > def.maxLength) {
        const shortText = str.slice(0, def.maxLength).trim();
        valueHtml =
          '<span class="mosi-text-short">' +
          escapeWithBreaks(shortText) +
          "…</span>" +
          '<span class="mosi-text-full" style="display:none;">' +
          escapeWithBreaks(str) +
          "</span>" +
          '<button type="button" class="mosi-read-more" data-expanded="false">...leggi tutto</button>';
      } else {
        valueHtml = escapeWithBreaks(str);
      }
    }

    const wrapperClass =
      "mosi-field" + (isLong ? " mosi-field--long" : "");

    return (
      '<div class="' + wrapperClass + '">' +
      '<div class="mosi-field-label">' +
      escapeHtml(label) +
      "</div>" +
      '<div class="mosi-field-value ' +
      (empty ? "mosi-empty" : "") +
      '">' +
      valueHtml +
      "</div>" +
      "</div>"
    );
  }

  function buildSectionsHTML(props, config, options) {
    const sections = groupFieldsBySection(props, config);
    const names = getOrderedSectionNames(sections, config);
    const fullWidthSections = (config && config.fullWidthSections) || [];

    const htmlParts = [];

    names.forEach(function (sectionName) {
      const fields = sections[sectionName];
      if (!fields || !fields.length) return;
      const isFull = fullWidthSections.indexOf(sectionName) !== -1;

      const fieldsHTML = fields
        .map(function (f) {
          return buildFieldHTML(f.label, f.value, f.def, options);
        })
        .join("");

      htmlParts.push(
        '<section class="mosi-section' +
          (isFull ? " mosi-section--full" : "") +
          '">' +
          '<h2 class="mosi-section-title">' +
          escapeHtml(sectionName) +
          "</h2>" +
          '<div class="mosi-fields">' +
          fieldsHTML +
          "</div>" +
          "</section>"
      );
    });

    return htmlParts.join("");
  }

  function defaultHeader(props, config) {
    var title =
      (config && config.label ? "Scheda " + config.label : "Scheda") || "Scheda";
    var idInterno = normalizeValue(props.fid || "");
    var secondLine = idInterno ? "ID interno: " + idInterno : "";

    return (
      '<header class="mosi-card-header">' +
      '<h1 class="mosi-card-title">' +
      escapeHtml(title) +
      "</h1>" +
      (secondLine
        ? '<p class="mosi-card-subtitle">' + escapeHtml(secondLine) + "</p>"
        : "") +
      "</header>"
    );
  }

  // --------- Card schermo ---------

  function createCardHTML(feature, config) {
    const props = (feature && feature.properties) || {};
    const headerHTML =
      (config && typeof config.buildHeader === "function"
        ? config.buildHeader(props)
        : defaultHeader(props, config)) || "";

    const sectionsHTML = buildSectionsHTML(props, config, {
      forPrint: false,
    });

    const bodyHTML =
      sectionsHTML ||
      '<p class="mosi-empty-state">Nessun dato da mostrare.</p>';

    return (
      '<article class="mosi-card">' +
      headerHTML +
      bodyHTML +
      "</article>"
    );
  }

  // --------- Card per stampa (PDF) ---------

  function createPrintCardHTML(feature, config) {
  const props = feature.properties || {};
  const geometry = feature.geometry || null;

  const headerHTML = config.buildPrintHeader
    ? config.buildPrintHeader(props)
    : "";

  // Se hai già una funzione che costruisce le sezioni per la stampa,
  // la riuso (era così nelle versioni precedenti).
  const sectionsHTML = buildSectionsHTML(props, config, true);

  let geomBlockHTML = "";

  if (geometry) {
    const mapId = `print-map-${Math.random().toString(36).slice(2)}`;

    // testo riassuntivo (quello che già avevi: Tipo, centro, bbox…)
    const geomTextHTML = summarizeGeometry(geometry);

    // registro un "job" globale che useremo dopo per creare le mappe
    window.PRINT_MAP_JOBS = window.PRINT_MAP_JOBS || [];
    window.PRINT_MAP_JOBS.push({
      mapId,
      feature,
    });

    geomBlockHTML = `
      <section class="mosi-print-geom">
        <div class="mosi-print-geom-meta">
          ${geomTextHTML}
        </div>
        <div class="mosi-print-geom-map" id="${mapId}"></div>
      </section>
    `;
  }

  return `
    <div class="mosi-print-card">
      ${headerHTML}
      ${geomBlockHTML}
      ${sectionsHTML}
    </div>
  `;
}

  // --------- Espone API globali ---------

  window.MosiMoprUtils = {
    normalizeValue: normalizeValue,
    isEmptyValue: isEmptyValue,
    escapeHtml: escapeHtml,
    escapeWithBreaks: escapeWithBreaks,
    createCardHTML: createCardHTML,
    createPrintCardHTML: createPrintCardHTML,
    summarizeGeometryForExport: summarizeGeometry,
  };
})();
