document.addEventListener('DOMContentLoaded', () => {
  const tree = document.getElementById('encyclopedia');
  const addMainBtn = document.getElementById('add-main');
  const inputRicerca = document.getElementById('search-input');
  const btnRicerca = document.getElementById('search-btn');
  const btnClear = document.getElementById('clear-btn');
  const actionSelect = document.getElementById('action-select');
  const toggleBtn = document.getElementById('toggle-theme');


  // Applica il tema salvato
  if (localStorage.getItem('tema') === 'scuro') {
    document.body.classList.add('dark-mode');
  }

  // CAMBIO TEMA
  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('tema', isDark ? 'scuro' : 'chiaro');
  });

  let modalitaModificaAttiva = false;
/////////////////////////////////////////////////////////////////////////////////////////
  //SELEZIONE AZIONE
  actionSelect.addEventListener('change', () => {
    const action = actionSelect.value;

    // Pulisce eventuali pulsanti eliminazione già presenti
    document.querySelectorAll('.delete-btn').forEach(btn => btn.remove());
    document.body.classList.remove('delete-mode');

    if (action === 'elimina') {
      document.body.classList.add('delete-mode');

      document.querySelectorAll('.title').forEach(titolo => {
        const btn = document.createElement('button');
        btn.className = 'delete-btn';
        btn.textContent = '–';

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const blocco = titolo.closest('.main-item, .sub-item, .sub-sub-item');
          if (blocco) blocco.remove();
          salvaAlbero();

          // Se non ci sono più pulsanti ➖, esci da modalità elimina
          if (!document.querySelector('.delete-btn')) {
            document.body.classList.remove('delete-mode');
            actionSelect.value = '';
          }
        });

        titolo.appendChild(btn);
      });
    } else {
      // Se si cambia selezione, togli tutto
      document.querySelectorAll('.delete-btn').forEach(btn => btn.remove());
      document.body.classList.remove('delete-mode');
    }
  });
//////////////////////////////////////////////////////////////////////////////////////////
  // MODALITà MODIFICA
  actionSelect.addEventListener('change', () => {
    modalitaModificaAttiva = actionSelect.value === 'modifica';
  });


  tree.addEventListener('dblclick', (e) => {
    if (!modalitaModificaAttiva) return;

    const titolo = e.target.closest('.title');
    if (!titolo) return;

    if (e.target.classList.contains('control-btn')) return;
    if (titolo.querySelector('input')) return;

    const testoOriginale = [...titolo.childNodes]
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent.trim())
      .join(' ')
      .trim();

    const input = document.createElement('input');
    input.type = 'text';
    input.value = testoOriginale;
    input.className = 'modifica-input';

    const bottoneOk = document.createElement('button');
    bottoneOk.textContent = '✔️ OK';
    bottoneOk.className = 'control-btn';

    const bottoneAggiungi = titolo.querySelector('.control-btn');
    if (bottoneAggiungi) bottoneAggiungi.remove();

    titolo.textContent = '';
    titolo.appendChild(input);
    titolo.appendChild(bottoneOk);
    if (bottoneAggiungi) titolo.appendChild(bottoneAggiungi);

    const conferma = () => {
      const nuovoTesto = input.value.trim();
      titolo.textContent = nuovoTesto;
      if (bottoneAggiungi) titolo.appendChild(bottoneAggiungi);
      salvaAlbero();
      // Disattiva modalità modifica
      actionSelect.value = '';
      modalitaModificaAttiva = false;
    };

    bottoneOk.addEventListener('click', conferma);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') conferma();
    });

    input.focus();
  });

//salvataggio dell'albero
  function salvaAlbero() {
    localStorage.setItem('alberoEnciclopedia', tree.innerHTML);
  }
// chiudi tutto(dopo chiusura ricerca)
  function chiudiTutti() {
    document.querySelectorAll('.content.expanded').forEach(c => c.classList.remove('expanded'));
    document.querySelectorAll('.title.expanded').forEach(t => t.classList.remove('expanded'));
  }
// caricare nel local storage
  function caricaAlbero() {
    const salvato = localStorage.getItem('alberoEnciclopedia');
    if (salvato) {
      tree.innerHTML = salvato;
    }
  }

  caricaAlbero();
  chiudiTutti();
  inizializzaControlliEsistenti();
//crezione elemento
  function createElement(tag, className, textContent = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
  }

  function attachToggle(title, content) {
    if (!content) return;
    title.addEventListener('click', () => {
      const expanded = content.classList.contains('expanded');
      content.classList.toggle('expanded', !expanded);
      title.classList.toggle('expanded', !expanded);
    });
  }
// creazione controlli
  function createControls(titleEl, contentEl, level) {
    if (level < 2) {
      const oldBtns = titleEl.querySelectorAll('.control-btn');
      oldBtns.forEach(btn => btn.remove());
      const addBtn = createElement('button', 'control-btn', '➕ Aggiungi');
      addBtn.onclick = (e) => {
        e.stopPropagation();
        const text = prompt(`Inserisci ${level === 0 ? 'una selezione' : 'una sottoselezione'}`);
        if (!text) return;
        if (level === 0) {
          const subItem = createSubItem(text);
          contentEl.appendChild(subItem);
        } else if (level === 1) {
          const subSubItem = createSubSubItem(text);
          contentEl.appendChild(subSubItem);
        }
        salvaAlbero();
      };
      titleEl.appendChild(addBtn);
    }
  }
//inizzializzazione controlli
  function inizializzaControlliEsistenti() {
    document.querySelectorAll('.main-item').forEach(main => {
      const titolo = main.querySelector(':scope > .title');
      const contenuto = main.querySelector(':scope > .content');
      attachToggle(titolo, contenuto);
      createControls(titolo, contenuto, 0);
      contenuto.querySelectorAll('.sub-item').forEach(sub => {
        const titoloSub = sub.querySelector(':scope > .title');
        const contenutoSub = sub.querySelector(':scope > .content');
        attachToggle(titoloSub, contenutoSub);
        createControls(titoloSub, contenutoSub, 1);
        contenutoSub.querySelectorAll('.sub-sub-item').forEach(subSub => {
          const titoloSubSub = subSub.querySelector('.title');
          createControls(titoloSubSub, null, 2);
        });
      });
    });
  }


//sotto sotto titolo
  function createSubSubItem(text) {
    const item = createElement('div', 'sub-sub-item');
    const title = createElement('div', 'title', text);
    createControls(title, null, 2);
    contatore = 0;

    // Crea il pulsante per aggiungere la descrizione
    const addDescBtn = createElement('button', 'add-desc-btn', '✏️ ');
    title.appendChild(addDescBtn);

    addDescBtn.addEventListener('click', () => {
      if(contatore == 0){
        addDescriptionInput(title, item);
        contatore+=1;
      }else{
        modifyDescription(title);
      }
    });
    item.appendChild(title);
    return item;
  }

  // aggiungi desrizione
  function addDescriptionInput(titleEl, item) {
    // Crea un campo di input per la descrizione
    const inputDesc = createElement('input', 'description-input');
    inputDesc.placeholder = 'Aggiungi una descrizione...';
    inputDesc.type = 'text';

    // Posiziona l'input accanto al titolo
    titleEl.appendChild(inputDesc);
    inputDesc.focus();

    // Aggiungi il pulsante OK per confermare la descrizione
    const okBtn = createElement('button', 'ok-btn', '✔️ OK');
    titleEl.appendChild(okBtn);

    okBtn.addEventListener('click', () => {
      const description = inputDesc.value.trim();

      if (description) {
        // Aggiungi la descrizione accanto al titolo (senza creare un nuovo campo di input)
        const descSpan = createElement('span', 'description', description);
        titleEl.appendChild(descSpan);  // Aggiungi il nuovo span con descrizione
      }

      // Rimuovi il campo di input e il pulsante OK
      inputDesc.remove();
      okBtn.remove();

      // Salva la descrizione nel localStorage
      salvaDescrizione(description, item);

      // Aggiorna l'albero (se necessario)
      salvaAlbero();
    });
  }

  //modifica descrizione
  function modifyDescription(titleEl) {
    // Verifica se c'è già una descrizione
    let existingDesc = titleEl.querySelector('.description');

    // Se la descrizione esiste, crea un campo di input per modificarla
    if (existingDesc) {
      // Crea un campo di input con il testo attuale della descrizione
      const inputDesc = createElement('input', 'description-input');
      inputDesc.value = existingDesc.textContent.trim(); // Popola il campo con la descrizione esistente
      titleEl.appendChild(inputDesc);
      inputDesc.focus(); // Fai in modo che l'input sia selezionato

      // Aggiungi un pulsante OK per confermare la modifica
      const okBtn = createElement('button', 'ok-btn', '✔️ OK');
      titleEl.appendChild(okBtn);

      // Quando l'utente preme OK, aggiorna la descrizione
      okBtn.addEventListener('click', () => {
        const newDescription = inputDesc.value.trim();
        if (newDescription) {
          // Aggiorna il testo della descrizione esistente con il nuovo testo
          existingDesc.textContent = newDescription;
        }

        // Rimuovi il campo di input e il pulsante OK
        inputDesc.remove();
        okBtn.remove();

        // Salva l'albero aggiornato
        salvaAlbero();
      });
    }
  }
//salva descrizione
  function salvaDescrizione(text, item) {
    const itemId = item.querySelector('.title').textContent.trim(); // Usa il titolo come identificativo unico
    const storedData = JSON.parse(localStorage.getItem('descrizioni')) || {}; // Carica i dati esistenti
    storedData[itemId] = text; // Salva o aggiorna la descrizione associata
    localStorage.setItem('descrizioni', JSON.stringify(storedData)); // Salva nel localStorage
  }
//sottotitolo
  function createSubItem(text) {
    const item = createElement('div', 'sub-item');
    const title = createElement('div', 'title', text);
    const content = createElement('div', 'content');
    attachToggle(title, content);
    createControls(title, content, 1);
    item.appendChild(title);
    item.appendChild(content);
    return item;
  }
//titolo
  function createMainItem(text) {
    const item = createElement('div', 'main-item');
    const title = createElement('div', 'title', text);
    const content = createElement('div', 'content');
    attachToggle(title, content);
    createControls(title, content, 0);
    item.appendChild(title);
    item.appendChild(content);
    return item;
  }
//creazione titolo
  addMainBtn.addEventListener('click', () => {
    const title = prompt('Titolo principale:');
    if (title) {
      tree.appendChild(createMainItem(title));
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

