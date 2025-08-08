document.addEventListener('DOMContentLoaded', () => {
  const encyclopedia = document.getElementById("encyclopedia");
  const addMainBtn = document.getElementById("add-main");
  const saveBtn = document.getElementById("save");
  const loadBtn = document.getElementById("load");
  const toggleBtn = document.getElementById('toggle-theme');
  const inputRicerca = document.getElementById('search-input');
  const btnRicerca = document.getElementById('search-btn');
  const btnClear = document.getElementById('clear-btn');

  // chiudi tutto(dopo chiusura ricerca)
  function chiudiTutti() {
    document.querySelectorAll('.content.expanded').forEach(c => c.classList.remove('expanded'));
    document.querySelectorAll('.title.expanded').forEach(t => t.classList.remove('expanded'));
  }

  // Applica il tema salvato
  if (localStorage.getItem('tema') === 'scuro') {
    document.body.classList.add('dark-mode');
  }

  // Cambia tema al click
  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('tema', isDark ? 'scuro' : 'chiaro');
  });

  // Utilità: crea elemento HTML
  function createElement(tag, className, textContent = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
  }

  // Toggle visibilità contenuto
function attachToggle(title, content) {
  if (!title || !content) return;

  // Remove any previous click event (prevent duplicate binding)
  const newTitle = title.cloneNode(true);
  newTitle.replaceChildren(...title.childNodes); // preserve children
  title.replaceWith(newTitle);

  newTitle.addEventListener('click', () => {
    const currentDisplay = window.getComputedStyle(content).display;
    content.style.display = currentDisplay === 'none' ? 'block' : 'none';
  });

  createControls(newTitle, content, 0); // Or whatever level is appropriate
}



  function createControls(titleEl, contentEl, level) {
    const existingControls = titleEl.querySelector('.controls');
    if (existingControls) existingControls.remove();

    const controls = createElement('div', 'controls');

    if (contentEl) {
      const addBtn = createElement('button', 'control-btn', '+ Aggiungi');
      addBtn.addEventListener('click', () => {
        const text = prompt('Titolo:');
        if (!text) return;

        let newItem;
        if (level === 0) newItem = createSubItem(text);
        else if (level === 1) newItem = createSubSubItem(text);
        else return;

        contentEl.appendChild(newItem);
        salvaAlbero();
      });
      controls.appendChild(addBtn);
    }

    const delBtn = createElement('button', 'control-btn', '🗑️');
    delBtn.addEventListener('click', () => {
      titleEl.parentElement.remove();
      salvaAlbero();
    });
    controls.appendChild(delBtn);

    const editBtn = createElement('button', 'control-btn', '✏️');
    editBtn.addEventListener('click', () => {
      const titleSpan = titleEl.querySelector('span');
      const currentText = titleSpan ? titleSpan.textContent : '';
      const newTitle = prompt('Modifica titolo:', currentText);
      if (newTitle && titleSpan) {
        titleSpan.textContent = newTitle;
        salvaAlbero();
      }
    });
    controls.appendChild(editBtn);

    titleEl.appendChild(controls);
  }

function createMainItem(text) {
  const item = createElement('div', 'main-item');
  const title = createElement('div', 'title');
  title.appendChild(createElement('span', '', text));
  const content = createElement('div', 'content');
  content.style.display = 'block'; // ✅ make it visible immediately
  attachToggle(title, content);
  createControls(title, content, 0);
  item.appendChild(title);
  item.appendChild(content);
  return item;
}


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

  function createSubSubItem(text) {
    const item = createElement('div', 'sub-sub-item');
    const title = createElement('div', 'title');
    title.appendChild(createElement('span', '', text));
    createControls(title, null, 2);
    addDescriptionInput(title, item);
    item.appendChild(title);
    return item;
  }

  function addDescriptionInput(titleEl, item) {
    const input = createElement('input', 'description-input');
    input.placeholder = 'Aggiungi una descrizione...';
    input.type = 'text';

    const okBtn = createElement('button', 'ok-btn', '✔️ OK');

    titleEl.appendChild(input);
    titleEl.appendChild(okBtn);
    input.focus();

    okBtn.addEventListener('click', () => {
      const desc = input.value.trim();
      if (desc) {
        const span = createElement('span', 'description', desc);
        titleEl.appendChild(span);
        salvaDescrizione(desc, item);
        salvaAlbero();
      }
      input.remove();
      okBtn.remove();
    });
  }

  function salvaDescrizione(text, item) {
    const key = item.querySelector('.title').textContent.trim();
    const stored = JSON.parse(localStorage.getItem('descrizioni')) || {};
    stored[key] = text;
    localStorage.setItem('descrizioni', JSON.stringify(stored));
  }

  function salvaAlbero() {
    localStorage.setItem("encyclopediaTree", encyclopedia.innerHTML);
  }

function reinitTree() {
  const mainItems = encyclopedia.querySelectorAll('.main-item');

  mainItems.forEach(main => {
    const mainTitle = main.querySelector(':scope > .title');
    const mainContent = main.querySelector(':scope > .content');

    attachToggle(mainTitle, mainContent);
    createControls(mainTitle, mainContent, 0);

    const subItems = mainContent.querySelectorAll('.sub-item');
    subItems.forEach(sub => {
      const subTitle = sub.querySelector(':scope > .title');
      const subContent = sub.querySelector(':scope > .content');

      attachToggle(subTitle, subContent);
      createControls(subTitle, subContent, 1);

      const subSubItems = subContent.querySelectorAll('.sub-sub-item');
      subSubItems.forEach(subSub => {
        const subSubTitle = subSub.querySelector(':scope > .title');
        if (subSubTitle) {
          createControls(subSubTitle, null, 2);

          const key = subSubTitle.textContent.trim();
          const stored = JSON.parse(localStorage.getItem('descrizioni')) || {};
          const desc = stored[key];

          if (desc && !subSubTitle.querySelector('.description')) {
            const span = createElement('span', 'description', desc);
            subSubTitle.appendChild(span);
          } else if (!desc && !subSubTitle.querySelector('input')) {
            addDescriptionInput(subSubTitle, subSub);
          }
        }
      });
    });
  });
}

  // Carica da Redis
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

  // Salva su Redis
  saveBtn.addEventListener("click", async () => {
    try {
      const response = await fetch("/api/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin",
        },
        body: JSON.stringify({ html: encyclopedia.innerHTML }),
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

  // Aggiungi titolo principale
  addMainBtn.addEventListener('click', () => {
    const title = prompt('Titolo principale:');
    if (title) {
      encyclopedia.appendChild(createMainItem(title));
      salvaAlbero();
    }
  });

    //Ricerca
  btnRicerca.addEventListener('click', () => {
    chiudiTutti();
    const query = inputRicerca.value.trim().toLowerCase();
    if (!query) return;
    document.querySelectorAll('.title').forEach(t => {
      const text = t.firstChild.textContent.toLowerCase();
      if (text.includes(query)) {
        t.classList.add('highlight');
        let el = t;
        while (el && !el.classList.contains('main-item')) {
          el = el.parentElement.closest('.content');
          if (el) el.classList.add('expanded');
        }
        t.classList.add('expanded');
      } else {
        t.classList.remove('highlight');
        const cont = t.nextElementSibling;
        if (cont && cont.classList.contains('expanded')) cont.classList.remove('expanded');
      }
    });
  });
inputRicerca.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      btnRicerca.click();
    }
  });

  btnClear.addEventListener('click', () => {
    inputRicerca.value = '';
    document.querySelectorAll('.title').forEach(t => t.classList.remove('highlight') && t.classList.remove('expanded'));
  });

});
