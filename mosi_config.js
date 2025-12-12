(function () {
  const Utils = window.MosiMoprUtils || {};
  const normalizeValue = Utils.normalizeValue;
  const isEmptyValue = Utils.isEmptyValue;

  const MOSI_FIELD_DEFS = {
    // CODICI
    gid: { label: "Codice univoco GNA", section: "Codici" },
    VRRP: { label: "Codice progetto di riferimento", section: "Codici" },
    ACCC: { label: "Codice identificativo", section: "Codici" },
    ACCS: { label: "Note al codice", section: "Codici" },
    AMA: { label: "Ambito di applicazione", section: "Codici" },
    AMB: { label: "Ambito (MOSI)", section: "Codici" },

    // DEFINIZIONE
    OGD: { label: "Definizione", section: "Definizione" },
    OGT: { label: "Tipologia", section: "Definizione" },
    OGN: { label: "Denominazione", section: "Definizione" },
    OGB: { label: "Situazione attuale", section: "Definizione" },
    OGZ: { label: "Specifiche allo stato attuale", section: "Definizione" },

    // BANCA DATI FEDERATA / ALTRE BD
    DBO: {
      label: "Banca dati di origine",
      section: "Banca dati di provenienza",
    },
    DBO_ID: {
      label: "Codice banca dati di origine",
      section: "Banca dati di provenienza",
    },
    CCO: { label: "Banca dati di riferimento", section: "Altre banche dati" },
    CCE: {
      label: "Codice banca dati di riferimento",
      section: "Altre banche dati",
    },
    CBC: {
      label: "Codice bene culturale – NCTN",
      section: "Altre banche dati",
    },

    // LOCALIZZAZIONE
    LCR: { label: "Regione", section: "Localizzazione" },
    LCP: { label: "Provincia", section: "Localizzazione" },
    LCC: { label: "Comune", section: "Localizzazione" },
    LCS: { label: "Stato", section: "Localizzazione" },
    LCI: { label: "Indirizzo", section: "Localizzazione" },
    LCV: {
      label: "Altri percorsi / specifiche",
      section: "Localizzazione",
    },
    PVL: { label: "Toponimo / località", section: "Localizzazione" },
    PVZ: { label: "Tipo di contesto", section: "Localizzazione" },

    // GEOREFERENZIAZIONE
    GEL: { label: "Tipo di localizzazione", section: "Georeferenziazione" },
    GPT: {
      label: "Tecnica di georeferenziazione",
      section: "Georeferenziazione",
    },
    GPM: {
      label: "Grado di precisione del posizionamento",
      section: "Georeferenziazione",
    },
    GPBB: {
      label: "Base cartografica di riferimento",
      section: "Georeferenziazione",
    },
    GEN: { label: "Note al posizionamento", section: "Georeferenziazione" },

    // ACCESSIBILITÀ
    ACBA: { label: "Accessibilità", section: "Accessibilità" },
    ACBS: { label: "Note all'accessibilità", section: "Accessibilità" },

    // QUOTE
    MTAM: { label: "Quota minima (m s.l.m.)", section: "Quote" },
    MTAX: { label: "Quota massima (m s.l.m.)", section: "Quote" },
    MTAR: { label: "Quota relativa", section: "Quote" },
    MTAS: { label: "Note alle quote", section: "Quote" },

    // DESCRIZIONE
    DES: { label: "Descrizione", section: "Descrizione" },
    OGM: { label: "Modalità di individuazione", section: "Descrizione" },

    // MATERIALI
    MATP: { label: "Presenza di materiali", section: "Materiali" },
    MATN: { label: "Note ai materiali", section: "Materiali" },

    // CRONOLOGIA
    DTR: { label: "Cronologia generica", section: "Cronologia" },
    DTSI: { label: "Data inizio", section: "Cronologia" },
    DTSV: { label: "Validità data inizio", section: "Cronologia" },
    DTSF: { label: "Data fine", section: "Cronologia" },
    DTSL: { label: "Validità data fine", section: "Cronologia" },
    DTT: { label: "Note alla cronologia", section: "Cronologia" },

    // CONDIZIONE GIURIDICA E PROVVEDIMENTI
    CDGG: {
      label: "Condizione giuridica",
      section: "Condizione giuridica e provvedimenti",
    },
    BPT: {
      label: "Provvedimenti amministrativi / sintesi",
      section: "Condizione giuridica e provvedimenti",
    },

    // STRUMENTI URBANISTICI
    STUE: {
      label: "Ente / amministrazione",
      section: "Strumenti urbanistici",
    },
    STUT: { label: "Tipo di strumento", section: "Strumenti urbanistici" },
    STUS: {
      label: "Note agli strumenti urbanistici",
      section: "Strumenti urbanistici",
    },

    // VINCOLI
    NVCT: { label: "Normativa di riferimento", section: "Vincoli" },
    NVCM: { label: "Provvedimento di tutela", section: "Vincoli" },
    NVCE: { label: "Estremi del provvedimento", section: "Vincoli" },
    NVCP: { label: "Estensione del vincolo", section: "Vincoli" },
    NVCN: { label: "Note ai vincoli", section: "Vincoli" },

    // FOTOINTERPRETAZIONE
    FOIT: { label: "Tipo di immagine", section: "Fotointerpretazione" },
    FOIR: { label: "Riferimento cronologico", section: "Fotointerpretazione" },
    FOIA: { label: "Origine anomalia", section: "Fotointerpretazione" },
    FOIQ: { label: "Tipo di anomalia", section: "Fotointerpretazione" },
    FOIO: { label: "Affidabilità", section: "Fotointerpretazione" },
    FOIF: {
      label: "Classificazione anomalia",
      section: "Fotointerpretazione",
    },
    FOIN: {
      label: "Note alla fotointerpretazione",
      section: "Fotointerpretazione",
    },

    // BIBLIOGRAFIA E ARCHIVIO
    BIBR: { label: "Abbreviazione", section: "Bibliografia e archivio" },
    BIBM: {
      label: "Riferimenti bibliografici",
      section: "Bibliografia e archivio",
    },
    DOZ: {
      label: "Archivio di riferimento",
      section: "Bibliografia e archivio",
    },

    // CERTIFICAZIONE E GESTIONE
    FUR: {
      label: "Funzionario responsabile",
      section: "Certificazione e dati",
    },
    CMA: { label: "Anno di redazione", section: "Certificazione e dati" },
    CMC: {
      label: "Responsabile della redazione",
      section: "Certificazione e dati",
    },
    CMR: {
      label: "Responsabile dei contenuti",
      section: "Certificazione e dati",
    },
    CML: {
      label: "Autore ultima modifica",
      section: "Certificazione e dati",
    },
    ADP: {
      label: "Profilo di accesso ai dati",
      section: "Certificazione e dati",
    },
    GNA: {
      label: "Riutilizzo MOSI da GNA",
      section: "Certificazione e dati",
    },
    SSK: { label: "Stato scheda", section: "Certificazione e dati" },

    // IMMAGINE
    DCMA: { label: "Autore immagine", section: "Immagine" },
    DCME: { label: "Ente proprietario", section: "Immagine" },
    DCMR: { label: "Data dell'immagine", section: "Immagine" },
    DCMM: { label: "Titolo / didascalia", section: "Immagine" },
    DCML: { label: "Licenza d'uso", section: "Immagine" },
    DCMW: { label: "Indirizzo web (URL)", section: "Immagine" },
    DCMT: { label: "Note", section: "Immagine" },
    DCMK: { label: "Immagine", section: "Immagine" },

    // POTENZIALE ARCHEOLOGICO
    VRPI: {
      label: "Interpretazione del sito / contenuto fossilifero",
      section: "Potenziale archeologico",
    },
    VRPA: { label: "Affidabilità", section: "Potenziale archeologico" },
    VRPV: {
      label: "Valutazione nel contesto",
      section: "Potenziale archeologico",
    },
    VRPS: {
      label: "Potenziale / sintesi",
      section: "Potenziale archeologico",
    },
    VRPN: {
      label: "Note al potenziale archeologico",
      section: "Potenziale archeologico",
    },

    // RISCHIO RELATIVO
    VRRO: {
      label: "Distanza dall'opera in progetto (m)",
      section: "Rischio relativo",
    },
    VRRR: {
      label: "Valutazione rispetto all'opera in progetto",
      section: "Rischio relativo",
    },
    VRRS: { label: "Rischio / sintesi", section: "Rischio relativo" },
    VRRN: { label: "Note al rischio", section: "Rischio relativo" },
  };

  const MOSI_SECTION_ORDER = [
    "Codici",
    "Definizione",
    "Localizzazione",
    "Georeferenziazione",
    "Accessibilità",
    "Quote",
    "Descrizione",
    "Materiali",
    "Cronologia",
    "Condizione giuridica e provvedimenti",
    "Strumenti urbanistici",
    "Vincoli",
    "Fotointerpretazione",
    "Bibliografia e archivio",
    "Certificazione e dati",
    "Immagine",
    "Potenziale archeologico",
    "Rischio relativo",
    "Banca dati di provenienza",
    "Altre banche dati",
  ];

  function buildMosiHeader(props) {
    const denom = normalizeValue(props.OGN || "vuoto");
    const comune = normalizeValue(props.LCC || "vuoto");
    const provincia = normalizeValue(props.LCP || "vuoto");
    const regione = normalizeValue(props.LCR || "vuoto");
    const cronGen = normalizeValue(props.DTR || "vuoto");
    const idGNA = normalizeValue(
      props.gid || props.gid === 0 ? props.gid : "vuoto"
    );

    const badges = [];

    if (!isEmptyValue(props.OGD)) {
      badges.push(
        `<span class="mosi-badge">${normalizeValue(props.OGD)}</span>`
      );
    }
    if (!isEmptyValue(cronGen)) {
      badges.push(
        `<span class="mosi-badge mosi-badge-muted">Cronologia: ${cronGen}</span>`
      );
    }
    if (!isEmptyValue(props.PVZ)) {
      badges.push(
        `<span class="mosi-badge mosi-badge-muted">Contesto: ${normalizeValue(
          props.PVZ
        )}</span>`
      );
    }

    return `
      <header class="mosi-card-header">
        <h1 class="mosi-card-title">${denom}</h1>
        <p class="mosi-card-subtitle">
          ${!isEmptyValue(comune) ? "Comune: " + comune : "Comune: vuoto"}${
      !isEmptyValue(provincia) ? " (Prov. " + provincia + ")" : ""
    }${!isEmptyValue(regione) ? " – Regione: " + regione : ""} · Codice GNA: ${idGNA}
        </p>
        ${
          badges.length
            ? `<div class="mosi-card-badges">${badges.join("")}</div>`
            : ""
        }
      </header>
    `;
  }

  function buildMosiPrintHeader(props) {
    const denom = normalizeValue(props.OGN || "vuoto");
    const comune = normalizeValue(props.LCC || "vuoto");
    const provincia = normalizeValue(props.LCP || "vuoto");
    const regione = normalizeValue(props.LCR || "vuoto");
    const idGNA = normalizeValue(
      props.gid || props.gid === 0 ? props.gid : "vuoto"
    );

    return `
      <h1>${denom}</h1>
      <p>
        Comune: ${comune}${
      !isEmptyValue(provincia) ? " (Prov. " + provincia + ")" : ""
    }${!isEmptyValue(regione) ? " – Regione: " + regione : ""} · Codice GNA: ${idGNA}
      </p>
    `;
  }

  function buildMosiListItemText(props) {
    const denom = normalizeValue(props.OGN || "vuoto");
    const comune = normalizeValue(props.LCC || "vuoto");
    const provincia = normalizeValue(props.LCP || "vuoto");
    const cron = normalizeValue(props.DTR || "vuoto");

    let meta = !isEmptyValue(comune) ? comune : "Comune: vuoto";
    if (!isEmptyValue(provincia)) meta += " (Prov. " + provincia + ")";
    if (!isEmptyValue(cron)) meta += " · " + cron;

    return {
      title: denom,
      meta,
    };
  }

  window.MOSI_CONFIG = {
    key: "mosi",
    label: "MOSI",
    geojsonUrl: "data/mosi.geojson",
    fieldDefs: MOSI_FIELD_DEFS,
    sectionOrder: MOSI_SECTION_ORDER,
    fullWidthSections: [
      "Descrizione",
      "Bibliografia e archivio",
      "Fotointerpretazione",
    ],
    searchFields: ["OGN", "LCC", "OGD", "DES"],
    buildHeader: buildMosiHeader,
    buildPrintHeader: buildMosiPrintHeader,
    buildListItemText: buildMosiListItemText,
  };
})();
