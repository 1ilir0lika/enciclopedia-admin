const encyclopedia = document.getElementById("encyclopedia");
const addMainBtn = document.getElementById("add-main");
const saveBtn = document.getElementById("save");
const loadBtn = document.getElementById("load");
const toggleThemeBtn = document.getElementById("toggle-theme");

toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
});

addMainBtn.addEventListener("click", () => {
  const para = document.createElement("p");
  para.contentEditable = true;
  para.className = "editable-paragraph";
  para.textContent = "Scrivi qui...";
  encyclopedia.appendChild(para);
  para.focus();
});

saveBtn.addEventListener("click", async () => {
  const html = encyclopedia.innerHTML;

  try {
    const response = await fetch("/api/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer admin",
      },
      body: JSON.stringify({ html }),
    });

    const result = await response.json();
    if (response.ok) {
      alert("Salvato con successo!");
    } else {
      throw new Error(result.error || "Errore salvataggio");
    }
  } catch (err) {
    alert("Errore durante il salvataggio: " + err.message);
  }
});

loadBtn.addEventListener("click", async () => {
  try {
    const response = await fetch("/api/get");
    const { html } = await response.json();
    encyclopedia.innerHTML = html;
  } catch (err) {
    alert("Errore durante il caricamento: " + err.message);
  }
});

