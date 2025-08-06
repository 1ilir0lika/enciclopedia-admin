const encyclopedia = document.getElementById("encyclopedia");
const addMainBtn = document.getElementById("add-main");
const saveBtn = document.getElementById("save");
const loadBtn = document.getElementById("load");
const toggleThemeBtn = document.getElementById("toggle-theme");

const actionSelect = document.getElementById("action-select");
const actionConfirmBtn = document.getElementById("action-confirm");

let selectedParagraph = null;

// Tema chiaro/scuro
toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
});

// Aggiungi nuovo paragrafo
addMainBtn.addEventListener("click", () => {
  const para = document.createElement("p");
  para.contentEditable = true;
  para.className = "editable-paragraph";
  para.textContent = "Scrivi qui...";
  encyclopedia.appendChild(para);
  setupParagraphEvents(para);
  para.focus();
});

// Salva su Redis
saveBtn.addEventListener("click", async () => {
  const html = encyclopedia.innerHTML;

  try {
    const response = await fetch("/api/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer admin", // Cambia se usi un token diverso
      },
      body: JSON.stringify({ html }),
    });

    const result = await response.json();
    if (response.ok) {
      alert("✅ Salvato con successo!");
    } else {
      throw new Error(result.error || "Errore salvataggio");
    }
  } catch (err) {
    alert("❌ Errore durante il salvataggio: " + err.message);
  }
});

//carica da redis
loadBtn.addEventListener("click", async () => {
  try {
    const response = await fetch("/api/get");
    const data = await response.json(); // ✅ decodifica JSON
    console.log(data); // debug
    encyclopedia.innerHTML = data.html || ""; // ✅ inserisci il contenuto HTML
    makeAllParagraphsEditable();
  } catch (err) {
    alert("❌ Errore durante il caricamento: " + err.message);
  }
});



// Rende ogni paragrafo esistente editabile e selezionabile
function makeAllParagraphsEditable() {
  const paragraphs = encyclopedia.querySelectorAll("p");
  paragraphs.forEach(setupParagraphEvents);
}

// Aggiunge eventi di modifica e selezione
function setupParagraphEvents(p) {
  p.contentEditable = true;
  p.classList.add("editable-paragraph");
  p.addEventListener("click", () => selectParagraph(p));
}

// Gestione selezione
function selectParagraph(p) {
  if (selectedParagraph) {
    selectedParagraph.classList.remove("selected");
  }
  selectedParagraph = p;
  p.classList.add("selected");
  actionConfirmBtn.style.display = "inline-block";
}

// Conferma azione dal menu (es. elimina)
actionConfirmBtn.addEventListener("click", () => {
  const action = actionSelect.value;
  if (!action || !selectedParagraph) return;

  if (action === "elimina") {
    selectedParagraph.remove();
  }

  if (action === "modifica") {
    selectedParagraph.focus();
  }

  selectedParagraph.classList.remove("selected");
  selectedParagraph = null;
  actionSelect.value = "";
  actionConfirmBtn.style.display = "none";
});
