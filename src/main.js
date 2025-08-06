import { setupThemeToggle } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  setupThemeToggle();

  const encyclopedia = document.getElementById("encyclopedia");
  const addMainBtn = document.getElementById("add-main");
  const saveBtn = document.getElementById("save");
  const loadBtn = document.getElementById("load");
  const actionSelect = document.getElementById("action-select");
  const actionConfirmBtn = document.getElementById("action-confirm");

  let selectedItem = null;

  // Crea elemento HTML con classe e testo opzionale
  function createElement(tag, className, textContent = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
  }

  // Toggle show/hide content
  function attachToggle(title, content) {
    title.addEventListener('click', () => {
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
    });
  }

  // Crea controlli (es. aggiungi sub, sub-sub)
  function createControls(titleEl, contentEl, level) {
    const controls = createElement('div', 'controls');

    if (level === 0) {
      const addSub = createElement('button', 'add-btn', '+ Sub');
      addSub.addEventListener('click', () => {
        const text = prompt('Titolo sottosezione:');
        if (text) {
          const sub = createSubItem(text);
          contentEl.appendChild(sub);
          salvaAlbero();
        }
      });
      controls.appendChild(addSub);
    }

    if (level === 1) {
      const addSubSub = createElement('button', 'add-btn', '+ Sub-Sub');
      addSubSub.addEventListener('click', () => {
        const text = prompt('Sotto sotto titolo:');
        if (text) {
          const subSub = createSubSubItem(text);
          contentEl.appendChild(subSub);
          salvaAlbero();
        }
      });
      controls.appendChild(addSubSub);
    }

    const delBtn = createElement('button', 'delete-btn', '🗑️');
    delBtn.addEventListener('click', () => {
      titleEl.parentElement.remove();
      salvaAlbero();
    });
    controls.appendChild(delBtn);

    const editBtn = createElement('button', 'edit-btn', '✏️');
    editBtn.addEventListener('click', () => {
      const newTitle = prompt('Modifica titolo:', titleEl.firstChild.textContent);
      if (newTitle) {
        titleEl.firstChild.textContent = newTitle;
        salvaAlbero();
      }
    });
    controls.appendChild(editBtn);

    titleEl.appendChild(controls);
  }

  // 🔼 Titolo principale
  function createMainItem(text) {
    const item = createElement('div', 'main-item');
    const title = createElement('div', 'title');
    title.appendChild(createElement('span', '', text));
    const content = createElement('div', 'content');
    attachToggle(title, content);
    createControls(title, content, 0);
    item.appendChild(title);
    item.appendChild(content);
    return item;
  }

  // 🔼 Sottotitolo
  function createSubItem(text) {
    const item = createElement('div', 'sub-item');
    const title = createElement('div', 'title');
    title.appendChild(createElement('span', '', text));
    const content = createElement('div', 'content');
    attachToggle(title, content);
    createControls(title, content, 1);
    item.appendChild(title);
    item.appendChild(content);
    return item;
  }

  // 🔼 Sotto-sottotitolo + descrizione
  function createSubSubItem(text) {
    const item = createElement('div', 'sub-sub-item');
    const title = createElement('div', 'title');
    title.appendChild(createElement('span', '', text));
    createControls(title, null, 2);
    addDescriptionInput(title, item);
    item.appendChild(title);
    return item;
  }

  // 🔼 Aggiungi descrizione
  function addDescriptionInput(titleEl, item) {
    const inputDesc = createElement('input', 'description-input');
    inputDesc.placeholder = 'Aggiungi una descrizione...';
    inputDesc.type = 'text';

    const okBtn = createElement('button', 'ok-btn', '✔️ OK');

    titleEl.appendChild(inputDesc);
    titleEl.appendChild(okBtn);
    inputDesc.focus();

    okBtn.addEventListener('click', () => {
      const description = inputDesc.value.trim();
      if (description) {
        const descSpan = createElement('span', 'description', description);
        titleEl.appendChild(descSpan);
        salvaDescrizione(description, item);
        salvaAlbero();
      }
      inputDesc.remove();
      okBtn.remove();
    });
  }

  // 🔼 Salva descrizione
  function salvaDescrizione(text, item) {
    const itemId = item.querySelector('.title').textContent.trim();
    const stored = JSON.parse(localStorage.getItem('descrizioni')) || {};
    stored[itemId] = text;
    localStorage.setItem('descrizioni', JSON.stringify(stored));
  }

  // 🔼 Carica salvataggio da Redis
  loadBtn.addEventListener("click", async () => {
    try {
      const response = await fetch("/api/get");
      const data = await response.json();
      encyclopedia.innerHTML = data.html || "";
      reinitTree();
    } catch (err) {
      alert("❌ Errore durante il caricamento: " + err.message);
    }
  });

  // 🔼 Salva su Redis
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
        alert("✅ Salvato con successo!");
      } else {
        throw new Error(result.error || "Errore salvataggio");
      }
    } catch (err) {
      alert("❌ Errore durante il salvataggio: " + err.message);
    }
  });

  // 🔼 Aggiungi nuovo titolo principale
  addMainBtn.addEventListener('click', () => {
    const title = prompt('Titolo principale:');
    if (title) {
      encyclopedia.appendChild(createMainItem(title));
      salvaAlbero();
    }
  });

  // 🔼 Salva struttura su localStorage
  function salvaAlbero() {
    localStorage.setItem("encyclopediaTree", encyclopedia.innerHTML);
  }
function reinitTree() {
  const mainItems = encyclopedia.querySelectorAll('.main-item');
  mainItems.forEach(main => {
    const title = main.querySelector('.title');
    const content = main.querySelector('.content');
    attachToggle(title, content);
    createControls(title, content, 0);

    const subItems = main.querySelectorAll('.sub-item');
    subItems.forEach(sub => {
      const subTitle = sub.querySelector('.title');
      const subContent = sub.querySelector('.content');
      attachToggle(subTitle, subContent);
      createControls(subTitle, subContent, 1);

      const subSubItems = sub.querySelectorAll('.sub-sub-item');
      subSubItems.forEach(subSub => {
        const subSubTitle = subSub.querySelector('.title');
        createControls(subSubTitle, null, 2);

        // Ricrea descrizione da localStorage
        const textKey = subSubTitle.textContent.trim();
        const stored = JSON.parse(localStorage.getItem('descrizioni')) || {};
        const desc = stored[textKey];
        if (desc) {
          const span = createElement('span', 'description', desc);
          subSubTitle.appendChild(span);
        } else {
          addDescriptionInput(subSubTitle, subSub);
        }
      });
    });
  });
}
});
