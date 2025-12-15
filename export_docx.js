(function () {
  function initExportButton() {
    const btn = document.getElementById("export-docx-current-btn");
    if (!btn) return;

    btn.addEventListener("click", handleExportClick);
  }

  function handleExportClick() {
    if (typeof window.getCurrentRecordForExport !== "function") {
      alert("Funzione di esportazione non disponibile");
      return;
    }

    const record = window.getCurrentRecordForExport();
    if (!record || !record.feature || !record.config) {
      alert("Nessuna scheda selezionata da esportare");
      return;
    }

    // Docx può esporre le classi sia come global che sotto window.docx
    const docxGlobal = window.docx || {};
    const DocClass = docxGlobal.Document || window.Document;
    const ParagraphClass = docxGlobal.Paragraph || window.Paragraph;
    const TextRunClass = docxGlobal.TextRun || window.TextRun;
    const PackerClass = docxGlobal.Packer || window.Packer;
    const HeadingLevelClass =
      docxGlobal.HeadingLevel || window.HeadingLevel || null;

    if (!DocClass || !ParagraphClass || !TextRunClass || !PackerClass) {
      alert("Libreria DOCX non caricata");
      return;
    }
    if (typeof saveAs === "undefined") {
      alert("Libreria FileSaver non caricata");
      return;
    }

    const { feature, config, datasetKey } = record;
    const props = feature.properties || {};

    const Utils = window.MosiMoprUtils || {};
    const normalizeValue =
      Utils.normalizeValue ||
      function (v) {
        if (v === null || v === undefined) return "";
        return String(v);
      };
    const isEmptyValue =
      Utils.isEmptyValue ||
      function (v) {
        return (
          v === null ||
          v === undefined ||
          v === "" ||
          v === "vuoto" ||
          v === "null"
        );
      };

    const doc = new DocClass();
    const children = [];

    // Titolo / sottotitolo come nella lista
    let title = "Scheda";
    let subtitle = "";
    if (typeof config.buildListItemText === "function") {
      const sum = config.buildListItemText(props) || {};
      if (sum.title) title = normalizeValue(sum.title);
      if (sum.meta) subtitle = normalizeValue(sum.meta);
    }

    children.push(
      new ParagraphClass({
        text: title,
        heading: HeadingLevelClass ? HeadingLevelClass.TITLE : undefined,
      })
    );

    if (subtitle) {
      children.push(
        new ParagraphClass({
          text: subtitle,
        })
      );
    }

    children.push(
      new ParagraphClass({
        text: `Sezione: ${config.label || datasetKey}`,
      })
    );

    children.push(new ParagraphClass(""));

    // Campi per sezione (come nella stampa)
    const fieldDefs = config.fieldDefs || {};
    const sectionsMap = {};

    Object.keys(fieldDefs).forEach((fieldName) => {
      const def = fieldDefs[fieldName];
      const sectionName = def.section || "Altro";
      const raw = props[fieldName];
      const value = normalizeValue(raw);
      if (isEmptyValue(value)) return;
      if (!sectionsMap[sectionName]) sectionsMap[sectionName] = [];
      sectionsMap[sectionName].push({
        label: def.label || fieldName,
        value,
      });
    });

    const sectionOrder = config.sectionOrder || Object.keys(sectionsMap);

    sectionOrder.forEach((sectionName) => {
      const entries = sectionsMap[sectionName];
      if (!entries || !entries.length) return;

      children.push(
        new ParagraphClass({
          text: sectionName,
          heading: HeadingLevelClass ? HeadingLevelClass.HEADING_2 : undefined,
        })
      );

      entries.forEach((entry) => {
        children.push(
          new ParagraphClass({
            children: [
              new TextRunClass({
                text: entry.label + ": ",
                bold: true,
              }),
              new TextRunClass({
                text: entry.value,
              }),
            ],
          })
        );
      });

      children.push(new ParagraphClass(""));
    });

    // Aggiungo i paragrafi alla sezione
    children.forEach((p) => doc.addParagraph(p));

    const packer = new PackerClass();
    const fileNameSafe =
      title.replace(/[\\/:*?"<>|]+/g, "_").slice(0, 80) || "scheda";

    packer.toBlob(doc).then((blob) => {
      saveAs(blob, fileNameSafe + ".docx");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initExportButton);
  } else {
    initExportButton();
  }
})();
