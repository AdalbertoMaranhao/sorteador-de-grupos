const form = document.querySelector("#raffle-form");
const raffleNameInput = document.querySelector("#raffle-name");
const resultsTitle = document.querySelector("#results-title");
const teamCountInput = document.querySelector("#team-count");
const studentCountInput = document.querySelector("#student-count");
const studentListInput = document.querySelector("#student-list");
const groupsContainer = document.querySelector("#groups-container");
const summary = document.querySelector("#summary");
const exportButton = document.querySelector("#export-button");
const clearButton = document.querySelector("#clear-button");

const presentationForm = document.querySelector("#presentation-form");
const presentationCountInput = document.querySelector("#presentation-count");
const presentationDrawnInput = document.querySelector("#presentation-drawn");
const presentationResult = document.querySelector("#presentation-result");
const presentationStatus = document.querySelector("#presentation-status");
const resetPresentationsButton = document.querySelector("#reset-presentations");
const PRESENTATION_STORAGE_KEY = "sorteador-de-grupos:presentation-progress:v1";

let currentGroups = [];
let presentationTimer = null;

restorePresentationProgress();

function setPresentationStatus(message, isError = false) {
  presentationStatus.textContent = message;
  presentationStatus.classList.toggle("error", isError);
}

function getPresentationCount() {
  const count = Number(presentationCountInput.value);
  return Number.isSafeInteger(count) && count > 0 ? count : null;
}

function getPresentedGroups(count) {
  return [...new Set(presentationDrawnInput.value.split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= count))];
}

function showSavedPresentationStatus() {
  const count = getPresentationCount();
  const total = getPresentedGroups(count).length;
  setPresentationStatus(`${total} de ${count} grupos já apresentaram. Progresso salvo neste dispositivo.`);
}

function savePresentationProgress() {
  const count = getPresentationCount();
  if (count === null) {
    setPresentationStatus("Informe uma quantidade de grupos válida para salvar o progresso.", true);
    return;
  }
  try {
    localStorage.setItem(PRESENTATION_STORAGE_KEY, JSON.stringify({
      version: 1,
      count,
      drawn: presentationDrawnInput.value
    }));
    showSavedPresentationStatus();
  } catch {
    setPresentationStatus("Não foi possível salvar o progresso neste navegador. Mantenha esta página aberta ou anote os grupos que já apresentaram.", true);
  }
}

function restorePresentationProgress() {
  try {
    const raw = localStorage.getItem(PRESENTATION_STORAGE_KEY);
    if (raw === null) {
      setPresentationStatus("O progresso das apresentações é salvo automaticamente neste dispositivo.");
      return;
    }
    const saved = JSON.parse(raw);
    if (!saved || saved.version !== 1 || !Number.isSafeInteger(saved.count)
      || saved.count < 1 || typeof saved.drawn !== "string") {
      throw new Error("Progresso de apresentações inválido.");
    }
    presentationCountInput.value = String(saved.count);
    presentationDrawnInput.value = saved.drawn;
    showSavedPresentationStatus();
  } catch {
    setPresentationStatus("Não foi possível recuperar o progresso salvo neste navegador. Confira os grupos que já apresentaram antes de continuar.", true);
  }
}

function cancelPresentationDraw() {
  clearInterval(presentationTimer);
  presentationTimer = null;
}

presentationCountInput.addEventListener("input", () => {
  cancelPresentationDraw();
  presentationResult.classList.remove("visible");
  savePresentationProgress();
});
presentationDrawnInput.addEventListener("input", () => {
  cancelPresentationDraw();
  presentationResult.classList.remove("visible");
  savePresentationProgress();
});
resetPresentationsButton.addEventListener("click", () => {
  cancelPresentationDraw();
  presentationDrawnInput.value = "";
  presentationResult.classList.remove("visible");
  presentationResult.textContent = "";
  savePresentationProgress();
});

raffleNameInput.addEventListener("input", updateResultsTitle);

function getRaffleName() {
  return raffleNameInput.value.trim().replace(/\s+/g, " ");
}

function updateResultsTitle() {
  resultsTitle.textContent = getRaffleName() || "Grupos sorteados";
}

studentListInput.addEventListener("input", () => {
  const names = getNamesFromTextarea();

  if (names.length > 0) {
    studentCountInput.value = String(names.length);
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  drawGroups();
});

clearButton.addEventListener("click", () => {
  form.reset();
  updateResultsTitle();
  teamCountInput.value = "4";
  studentCountInput.value = "20";
  currentGroups = [];
  groupsContainer.innerHTML = "";
  exportButton.disabled = true;
  setSummary("Preencha os dados e clique em sortear para ver os grupos.");
});

exportButton.addEventListener("click", () => {
  if (currentGroups.length === 0) {
    return;
  }

  exportGroupsAsPdf(currentGroups);
});

presentationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  drawPresentation();
});

function drawPresentation() {
  cancelPresentationDraw();
  const count = getPresentationCount();
  
  if (!Number.isInteger(count) || count < 1) {
    return;
  }
  
  const drawnNumbers = getPresentedGroups(count);

  const availableGroups = [];
  for (let i = 1; i <= count; i++) {
    if (!drawnNumbers.includes(i)) {
      availableGroups.push(i);
    }
  }

  if (availableGroups.length === 0) {
    presentationResult.textContent = "Todos os grupos já apresentaram!";
    presentationResult.classList.add("visible");
    return;
  }

  let iterations = 0;
  const maxIterations = 15;
  presentationTimer = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * availableGroups.length);
    const randomTemp = availableGroups[randomIndex];
    presentationResult.textContent = `Sorteando: Grupo ${randomTemp}...`;
    presentationResult.classList.add("visible");
    
    iterations++;
    if (iterations >= maxIterations) {
      cancelPresentationDraw();
      const finalIndex = Math.floor(Math.random() * availableGroups.length);
      const finalResult = availableGroups[finalIndex];
      presentationResult.textContent = `🎉 O Grupo ${finalResult} vai apresentar!`;
      
      drawnNumbers.push(finalResult);
      presentationDrawnInput.value = drawnNumbers.join(", ");
      savePresentationProgress();
    }
  }, 50);
}

function drawGroups() {
  const teamCount = Number.parseInt(teamCountInput.value, 10);
  const totalStudents = Number.parseInt(studentCountInput.value, 10);
  const names = getNamesFromTextarea();

  if (!Number.isInteger(teamCount) || teamCount < 1) {
    showError("Informe uma quantidade de equipes maior que zero.");
    return;
  }

  if (names.length === 0 && (!Number.isInteger(totalStudents) || totalStudents < 1)) {
    showError("Informe o total de alunos ou cole uma lista de nomes.");
    return;
  }

  const students = names.length > 0
    ? names
    : Array.from({ length: totalStudents }, (_, index) => `Aluno ${index + 1}`);

  if (teamCount > students.length) {
    showError("A quantidade de equipes não pode ser maior que a quantidade de alunos.");
    return;
  }

  const shuffledStudents = shuffle(students);
  currentGroups = distributeStudents(shuffledStudents, teamCount);
  renderGroups(currentGroups, names.length > 0);
  exportButton.disabled = false;

  if (!presentationDrawnInput.value.trim() && presentationTimer === null) {
    presentationCountInput.value = String(teamCount);
    savePresentationProgress();
  }

  const mode = names.length > 0 ? "com nomes" : "por números";
  setSummary(`${students.length} alunos distribuídos em ${teamCount} equipes ${mode}.`);
}

function getNamesFromTextarea() {
  return studentListInput.value
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function distributeStudents(students, teamCount) {
  const groups = Array.from({ length: teamCount }, (_, index) => ({
    name: `Equipe ${index + 1}`,
    students: []
  }));

  students.forEach((student, index) => {
    groups[index % teamCount].students.push(student);
  });

  return groups;
}

function renderGroups(groups) {
  groupsContainer.innerHTML = "";

  groups.forEach((group) => {
    const card = document.createElement("article");
    card.className = "group-card";

    const header = document.createElement("header");
    const title = document.createElement("h3");
    const badge = document.createElement("span");

    title.textContent = group.name;
    badge.className = "badge";
    badge.textContent = `${group.students.length} ${group.students.length === 1 ? "aluno" : "alunos"}`;

    header.append(title, badge);

    const list = document.createElement("ol");
    group.students.forEach((student) => {
      const item = document.createElement("li");
      item.textContent = student;
      list.appendChild(item);
    });

    card.append(header, list);
    groupsContainer.appendChild(card);
  });
}

function setSummary(message) {
  summary.classList.remove("error");
  summary.textContent = message;
}

function showError(message) {
  currentGroups = [];
  groupsContainer.innerHTML = "";
  exportButton.disabled = true;
  summary.classList.add("error");
  summary.textContent = message;
}

function exportGroupsAsPdf(groups) {
  const raffleName = getRaffleName();
  const lines = buildPdfLines(groups, raffleName);
  const pdfContent = createPdfDocument(lines);
  const blob = new Blob([pdfContent], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = getPdfFilename(raffleName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getPdfFilename(raffleName) {
  const filename = raffleName
    .replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g, "-")
    .replace(/\.pdf$/i, "")
    .replace(/^[.\s]+|[.\s]+$/g, "");

  if (!filename || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(filename)) {
    return "grupos-sorteados.pdf";
  }

  return `${filename}.pdf`;
}

function buildPdfLines(groups, raffleName = "") {
  const now = new Date();
  const date = now.toLocaleDateString("pt-BR");
  const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const totalStudents = groups.reduce((sum, group) => sum + group.students.length, 0);
  const lines = [
    { text: raffleName || "Sorteador de Grupos", size: 18, bold: true },
    { text: `Gerado em ${date} às ${time}`, size: 10 },
    { text: `Total: ${totalStudents} alunos em ${groups.length} equipes`, size: 11 },
    { text: "", size: 10 }
  ];

  groups.forEach((group) => {
    lines.push({ text: `${group.name} (${group.students.length} alunos)`, size: 13, bold: true });

    group.students.forEach((student, index) => {
      lines.push({ text: `${index + 1}. ${student}`, size: 11 });
    });

    lines.push({ text: "", size: 10 });
  });

  return lines;
}

function createPdfDocument(lines) {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 48;
  const bottomMargin = 52;
  const lineHeight = 17;
  const pages = [];
  let currentPage = [];
  let y = pageHeight - margin;

  lines.forEach((line) => {
    const chunks = line.text ? wrapText(line.text, line.size) : [""];

    chunks.forEach((chunk) => {
      if (y < bottomMargin) {
        pages.push(currentPage);
        currentPage = [];
        y = pageHeight - margin;
      }

      currentPage.push({ ...line, text: chunk, y });
      y -= chunk ? lineHeight : 10;
    });
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>"
  ];
  const pageIds = [];
  const pageObjects = [];
  let nextId = 3;

  pages.forEach((page) => {
    const stream = createPageStream(page, margin, pageHeight);
    const streamId = nextId;
    const pageId = nextId + 1;

    pageObjects.push(`<< /Length ${byteLength(stream)} >>\nstream\n${stream}\nendstream`);
    pageObjects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >> >> >> /Contents ${streamId} 0 R >>`);
    pageIds.push(pageId);
    nextId += 2;
  });

  objects.push(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
  objects.push(...pageObjects);

  return assemblePdf(objects);
}

function createPageStream(pageLines, margin) {
  const commands = [
    "BT",
    "1 0 0 1 0 0 Tm",
    "0 0 0 rg"
  ];

  pageLines.forEach((line) => {
    if (!line.text) {
      return;
    }

    const font = line.bold ? "F2" : "F1";
    commands.push(`/${font} ${line.size} Tf`);
    commands.push(`${margin} ${line.y} Td`);
    commands.push(`(${escapePdfText(line.text)}) Tj`);
    commands.push(`${-margin} ${-line.y} Td`);
  });

  commands.push("ET");
  return commands.join("\n");
}

function wrapText(text, size) {
  const maxChars = size >= 18 ? 27 : size >= 13 ? 58 : 72;

  if (text.length <= maxChars) {
    return [text];
  }

  const words = text.split(" ").flatMap((word) => {
    const chunks = [];
    for (let index = 0; index < word.length; index += maxChars) {
      chunks.push(word.slice(index, index + maxChars));
    }
    return chunks;
  });
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length > maxChars) {
      if (currentLine) {
        lines.push(currentLine);
      }

      currentLine = word;
    } else {
      currentLine = candidate;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function escapePdfText(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7e]/gu, (character) => {
      const code = character.codePointAt(0);
      // Encode Latin-1 accents as PDF octal escapes, keeping byte offsets valid.
      if (code >= 160 && code <= 255) {
        return `\\${code.toString(8).padStart(3, "0")}`;
      }
      return removeDiacritics(character).replace(/[^\x20-\x7e]/gu, "?");
    });
}

function removeDiacritics(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function assemblePdf(objects) {
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

function byteLength(text) {
  return new TextEncoder().encode(text).length;
}
