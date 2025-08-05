const encyclopedia = document.getElementById("encyclopedia");
const addMainBtn = document.getElementById("add-main");
const saveBtn = document.getElementById("save");
const loadBtn = document.getElementById("load");
const toggleThemeBtn = document.getElementById("toggle-theme");
const actionSelect = document.getElementById("action-select");
const actionConfirmBtn = document.getElementById("action-confirm");

let selectedParagraph = null;

// 🌙 Cambia tema
toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
});

// ➕ Aggiungi nuovo paragrafo
addMainBtn.addEventListener("click", () => {
  const paragraph = createEditableParagraph("Scrivi qui...");
  encyclopedia.appendChild(paragraph);
  paragraph.focus();
});

// 💾 Salva contenuto
saveBtn.addEventListener("click", async () => {
  try {
    const html = encyclopedia.innerHTML;

    const res = await fetch("/api/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer admin",
      },
      body: JSON.stringify({ html }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Errore sconosciuto");

    alert("✅ Salvato con successo!");
  } catch (err) {
    alert("❌ Errore durante il salvataggio: " + err.message);
  }
});

// 🔄 Carica contenuto
loadBtn.addEventListener("click", async () => {
  try {
    const res = await fetch("/api/get");
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Errore sconosciuto");

    encyclopedia.innerHTML = data.html || "";
    makeAllParagraphsEditable();
  } catch (err) {
    alert("❌ Errore durante il caricamento: " + err.message);
  }
});

// 🔁 Aggiorna paragrafi con funzionalità di modifica/selezione
function makeAllParagraphsEditable() {
  const paragraphs = encyclopedia.querySelectorAll("p");
  paragraphs.forEach(p => {
    p.contentEditable = true;
    p.classList.add("editable-paragraph");
    p.addEventListener("click", () => selectParagraph(p));
  });
}

// ✏️ Crea un nuovo paragrafo pronto per la modifica
function createEditableParagraph(text = "") {
  const p = document.createElement("p");
  p.contentEditable = true;
  p.className = "editable-paragraph";
  p.textContent = text;
  p.addEventListener("click", () => selectParagraph(p));
  return p;
}

// ✅ Seleziona un paragrafo per azione
function selectParagraph(p) {
  if (selectedParagraph) {
    selectedParagraph.classList.remove("selected");
  }
  selectedParagraph = p;
  p.classList.add("selected");
  actionConfirmBtn.style.display = "inline-block";
}

// ▶️ Menu azioni (modifica/elimina)
actionSelect.addEventListener("change", () => {
  if (actionSelect.value) {
    actionConfirmBtn.style.display = "inline-block";
  } else {
    actionConfirmBtn.style.display = "none";
  }
});

// ✅ Esegui l’azione selezionata
actionConfirmBtn.addEventListener("click", () => {
  if (!selectedParagraph) {
    alert("Seleziona un paragrafo prima.");
    return;
  }

  const action = actionSelect.value;

  if (action === "elimina") {
    selectedParagraph.remove();
  } else if (action === "modifica") {
    selectedParagraph.focus();
  }

  // Reset
  selectedParagraph.classList.remove("selected");
  selectedParagraph = null;
  actionSelect.value = "";
  actionConfirmBtn.style.display = "none";
});
