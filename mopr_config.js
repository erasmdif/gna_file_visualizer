(function () {
  const Utils = window.MosiMoprUtils || {};
  const normalizeValue = Utils.normalizeValue;
  const isEmptyValue = Utils.isEmptyValue;

  const MOPR_FIELD_DEFS = {
    // CODICI / IDENTIFICAZIONE
    fid: { label: "ID interno", section: "Codici e riferimenti" },
    "Codice progetto (CPR) [*]": {
      label: "Codice progetto",
      section: "Identificazione progetto",
    },
    "Ente responsabile del progetto (ERP) [*]": {
      label: "Ente responsabile del progetto",
      section: "Identificazione progetto",
    },
    "Enti MiC coinvolti (EMC) [*]": {
      label: "Enti MiC coinvolti",
      section: "Identificazione progetto",
    },
    "Denominazione (OGN) [*]": {
      label: "Denominazione",
      section: "Identificazione progetto",
    },
    "Categoria dell'opera (CTG) [*]": {
      label: "Categoria dell'opera",
      section: "Identificazione progetto",
    },
    "Tipo di opera (OGT) [*]": {
      label: "Tipo di opera",
      section: "Identificazione progetto",
    },
    "Fase di progetto (OGF) [*]": {
      label: "Fase di progetto",
      section: "Identificazione progetto",
    },
    "Data della relazione archeologica (DRL) [*]": {
      label: "Data della relazione archeologica",
      section: "Identificazione progetto",
    },

    "Ente/Soggetto responsabile (ACCE)": {
      label: "Ente / Soggetto responsabile",
      section: "Codici e riferimenti",
    },
    "Codice identificativo (ACCC)": {
      label: "Codice identificativo (ACCC)",
      section: "Codici e riferimenti",
    },
    "Note (ACCS)": {
      label: "Note al codice",
      section: "Codici e riferimenti",
    },
    "Codice identificativo (RCGH) [*]": {
      label: "Codice identificativo RCGH",
      section: "Codici e riferimenti",
    },
    "Codice identificativo (DCMN)": {
      label: "Codice DCMN",
      section: "Codici e riferimenti",
    },
    MOPR_id: {
      label: "MOPR ID",
      section: "Codici e riferimenti",
    },
    gid: {
      label: "Codice univoco (gid)",
      section: "Codici e riferimenti",
    },

    // AMBITO E TUTELA
    "<B>(*) AMB - Ambito d tutela MiC [*]": {
      label: "Ambito di tutela MiC",
      section: "Ambito e tutela",
    },
    "Ambito di applicazione (AMA) [*]": {
      label: "Ambito di applicazione",
      section: "Ambito e tutela",
    },
    "SABAP di riferimento (ENTE) [*]": {
      label: "SABAP di riferimento",
      section: "Ambito e tutela",
    },
    "Note (ENTE_NOTE)": {
      label: "Note sull'ente",
      section: "Ambito e tutela",
    },
    "Profilo di accesso (ADP) [*]": {
      label: "Profilo di accesso",
      section: "Ambito e tutela",
    },

    // DESCRIZIONE OPERE
    "Descrizione delle opere in progetto (DES) [*] [10000 caratteri]": {
      label: "Descrizione delle opere in progetto",
      section: "Descrizione opere",
    },
    "Modalità di individuazione (OGM) [*]": {
      label: "Modalità di individuazione",
      section: "Descrizione opere",
    },

    // LOCALIZZAZIONE
    LCS: { label: "Stato", section: "Localizzazione" },
    "Regione (LCR) [*]": { label: "Regione", section: "Localizzazione" },
    "Provincia (LCP) [*]": {
      label: "Provincia",
      section: "Localizzazione",
    },
    "Comune (LCC) [*]": { label: "Comune", section: "Localizzazione" },

    // GEOREFERENZIAZIONE
    "Tipo di localizzazione (GEL) [*]": {
      label: "Tipo di localizzazione",
      section: "Georeferenziazione",
    },
    "Tipo di georeferenziazione (GET) [*]": {
      label: "Tipo di georeferenziazione",
      section: "Georeferenziazione",
    },
    GEP: { label: "Sistema di riferimento", section: "Georeferenziazione" },
    "Tecnica di georeferenziazione (GPT) [*]": {
      label: "Tecnica di georeferenziazione",
      section: "Georeferenziazione",
    },
    "Grado di precisione del posizionamento (GPM) [*]": {
      label: "Grado di precisione",
      section: "Georeferenziazione",
    },
    "Base cartografica (GPBB) [*]": {
      label: "Base cartografica",
      section: "Georeferenziazione",
    },
    "Note al posizionamento (GEN)": {
      label: "Note al posizionamento",
      section: "Georeferenziazione",
    },

    // MISURE
    "Tipo di misura (MISZ)": {
      label: "Tipo di misura",
      section: "Misure",
    },
    "Unità di misura (MISU)": {
      label: "Unità di misura",
      section: "Misure",
    },

    // QUADRO AMBIENTALE
    "Geomorfologia (CAE) [5000 caratteri]": {
      label: "Geomorfologia",
      section: "Quadro ambientale",
      truncate: true,
      maxLength: 500,
    },
    "Caratteri ambientali storici (CAS) [10000 caratteri]": {
      label: "Caratteri ambientali storici",
      section: "Quadro ambientale",
      truncate: true,
      maxLength: 500,
    },
    "Caratteri ambientali attuali (CAA) [10000 caratteri]": {
      label: "Caratteri ambientali attuali",
      section: "Quadro ambientale",
      truncate: true,
      maxLength: 500,
    },
    "Note (CAN) [2000 caratteri]": {
      label: "Note ambientali",
      section: "Quadro ambientale",
    },

    // QUADRO STORICO-ARCHEOLOGICO
    "Sintesi storico archeologica (CAV) [10000 caratteri]": {
      label: "Sintesi storico-archeologica",
      section: "Quadro storico-archeologico",
      truncate: true,
      maxLength: 500,
    },

    // IMMAGINE
    "Tipo (DCMP)": { label: "Tipo", section: "Immagine" },
    "Specifiche (DCMS)": { label: "Specifiche", section: "Immagine" },
    "Titolo/ didascalia (DCMM)": {
      label: "Titolo / didascalia",
      section: "Immagine",
    },
    "Autore (DCMA)": { label: "Autore", section: "Immagine" },
    "Riferimento cronologico (DCMR)": {
      label: "Riferimento cronologico",
      section: "Immagine",
    },
    "Ente proprietario (DCME)": {
      label: "Ente proprietario",
      section: "Immagine",
    },
    "Collocazione (DCMC)": { label: "Collocazione", section: "Immagine" },
    "Licenza (DCML)": { label: "Licenza", section: "Immagine" },
    "Indirizzo web (URL) (DCMW)": {
      label: "Indirizzo web (URL)",
      section: "Immagine",
    },
    "Autorizzazione privacy (DCMY)": {
      label: "Autorizzazione privacy",
      section: "Immagine",
    },
    "Nome fileDCMK)": {
      label: "Nome file",
      section: "Immagine",
    },
    "Note (DCMT)": { label: "Note", section: "Immagine" },

    // BIBLIOGRAFIA
    "Abbreviazioni bibliografiche (BIBR)": {
      label: "Abbreviazioni bibliografiche",
      section: "Bibliografia e archivio",
    },
    BIBX: {
      label: "Sigle bibliografiche",
      section: "Bibliografia e archivio",
    },
    "Riferimenti bibliografici completi (BIBM) [1000 caratteri]": {
      label: "Riferimenti bibliografici completi",
      section: "Bibliografia e archivio",
    },

    // CERTIFICAZIONE E DATI
    "Funzionario responsabile (FUR) [*]": {
      label: "Funzionario responsabile",
      section: "Certificazione e dati",
    },
    "Anno di redazione (CMA) [*]": {
      label: "Anno di redazione",
      section: "Certificazione e dati",
    },
    "Responsabile della compilazione (CMC) [*]": {
      label: "Responsabile della compilazione",
      section: "Certificazione e dati",
    },
    "Responsabile dei contenuti (CMR) [*]": {
      label: "Responsabile dei contenuti",
      section: "Certificazione e dati",
    },
    "Data della campagna di ricognizione (RGCD) [*]": {
      label: "Data della campagna di ricognizione",
      section: "Certificazione e dati",
    },
    "Ente schedatore (RCGJ) [*]": {
      label: "Ente schedatore",
      section: "Certificazione e dati",
    },
  };

  const MOPR_SECTION_ORDER = [
    "Identificazione progetto",
    "Ambito e tutela",
    "Descrizione opere",
    "Localizzazione",
    "Georeferenziazione",
    "Misure",
    "Quadro ambientale",
    "Quadro storico-archeologico",
    "Bibliografia e archivio",
    "Immagine",
    "Certificazione e dati",
    "Codici e riferimenti",
  ];

  function buildMoprHeader(props) {
    const denom = normalizeValue(props["Denominazione (OGN) [*]"] || "vuoto");
    const comune = normalizeValue(props["Comune (LCC) [*]"] || "vuoto");
    const provincia = normalizeValue(props["Provincia (LCP) [*]"] || "vuoto");
    const regione = normalizeValue(props["Regione (LCR) [*]"] || "vuoto");
    const codProj = normalizeValue(
      props["Codice progetto (CPR) [*]"] || "vuoto"
    );
    const categoria = normalizeValue(
      props["Categoria dell'opera (CTG) [*]"] || "vuoto"
    );
    const fase = normalizeValue(
      props["Fase di progetto (OGF) [*]"] || "vuoto"
    );
    const dataRel = normalizeValue(
      props["Data della relazione archeologica (DRL) [*]"] || "vuoto"
    );
    const ambitoTutela = normalizeValue(
      props["<B>(*) AMB - Ambito d tutela MiC [*]"] || "vuoto"
    );
    const ambitoApplic = normalizeValue(
      props["Ambito di applicazione (AMA) [*]"] || "vuoto"
    );

    const badges = [];

    if (!isEmptyValue(ambitoTutela)) {
      badges.push(
        `<span class="mosi-badge">Ambito MiC: ${ambitoTutela}</span>`
      );
    }
    if (!isEmptyValue(ambitoApplic)) {
      badges.push(
        `<span class="mosi-badge mosi-badge-muted">Ambito applicazione: ${ambitoApplic}</span>`
      );
    }
    if (!isEmptyValue(fase)) {
      badges.push(
        `<span class="mosi-badge mosi-badge-muted">Fase: ${fase}</span>`
      );
    }
    if (!isEmptyValue(dataRel)) {
      badges.push(
        `<span class="mosi-badge mosi-badge-muted">Relazione: ${dataRel}</span>`
      );
    }

    return `
      <header class="mosi-card-header">
        <h1 class="mosi-card-title">${denom}</h1>
        <p class="mosi-card-subtitle">
          ${!isEmptyValue(comune) ? "Comune: " + comune : "Comune: vuoto"}${
      !isEmptyValue(provincia) ? " (Prov. " + provincia + ")" : ""
    }${!isEmptyValue(regione) ? " – Regione: " + regione : ""}${
      !isEmptyValue(codProj) ? " · Codice progetto: " + codProj : ""
    }${!isEmptyValue(categoria) ? " · Categoria: " + categoria : ""}
        </p>
        ${
          badges.length
            ? `<div class="mosi-card-badges">${badges.join("")}</div>`
            : ""
        }
      </header>
    `;
  }

  function buildMoprPrintHeader(props) {
    const denom = normalizeValue(props["Denominazione (OGN) [*]"] || "vuoto");
    const comune = normalizeValue(props["Comune (LCC) [*]"] || "vuoto");
    const provincia = normalizeValue(props["Provincia (LCP) [*]"] || "vuoto");
    const regione = normalizeValue(props["Regione (LCR) [*]"] || "vuoto");
    const codProj = normalizeValue(
      props["Codice progetto (CPR) [*]"] || "vuoto"
    );

    return `
      <h1>${denom}</h1>
      <p>
        Comune: ${comune}${
      !isEmptyValue(provincia) ? " (Prov. " + provincia + ")" : ""
    }${!isEmptyValue(regione) ? " – Regione: " + regione : ""}${
      !isEmptyValue(codProj) ? " · Codice progetto: " + codProj : ""
    }
      </p>
    `;
  }

  function buildMoprListItemText(props) {
    const denom = normalizeValue(props["Denominazione (OGN) [*]"] || "vuoto");
    const comune = normalizeValue(props["Comune (LCC) [*]"] || "vuoto");
    const provincia = normalizeValue(props["Provincia (LCP) [*]"] || "vuoto");
    const fase = normalizeValue(
      props["Fase di progetto (OGF) [*]"] || "vuoto"
    );
    const codProj = normalizeValue(
      props["Codice progetto (CPR) [*]"] || "vuoto"
    );

    let meta = !isEmptyValue(comune) ? comune : "Comune: vuoto";
    if (!isEmptyValue(provincia)) meta += " (Prov. " + provincia + ")";
    if (!isEmptyValue(codProj)) meta += " · Progetto: " + codProj;
    if (!isEmptyValue(fase)) meta += " · Fase: " + fase;

    return {
      title: denom,
      meta,
    };
  }

  window.MOPR_CONFIG = {
    key: "mopr",
    label: "MOPR",
    geojsonUrl: "data/mopr.geojson",
    fieldDefs: MOPR_FIELD_DEFS,
    sectionOrder: MOPR_SECTION_ORDER,
    fullWidthSections: [
      "Descrizione opere",
      "Quadro ambientale",
      "Quadro storico-archeologico",
      "Bibliografia e archivio",
    ],
    searchFields: [
      "Denominazione (OGN) [*]",
      "Comune (LCC) [*]",
      "Descrizione delle opere in progetto (DES) [*] [10000 caratteri]",
    ],
    buildHeader: buildMoprHeader,
    buildPrintHeader: buildMoprPrintHeader,
    buildListItemText: buildMoprListItemText,
  };
})();
