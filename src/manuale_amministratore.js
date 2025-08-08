function clearHighlights() {
  const marks = document.querySelectorAll("mark");
  marks.forEach(mark => {
    const parent = mark.parentNode;
    parent.replaceChild(document.createTextNode(mark.textContent), mark);
    parent.normalize(); // Unisce nodi di testo adiacenti
  });
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cercaTesto(termine) {
  clearHighlights(); // Prima rimuovi eventuali evidenziazioni precedenti

  const testoCercato = termine.toLowerCase().trim();
  if (testoCercato === "") return 0;

  const elementi = document.body.querySelectorAll("h1, h2, h3, p, li, span, div");
  let risultati = 0;

  elementi.forEach(el => {
    el.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const regex = new RegExp(`(${escapeRegExp(testoCercato)})`, 'gi');
        if (regex.test(text)) {
          const frag = document.createDocumentFragment();
          let lastIndex = 0;
          text.replace(regex, (match, p1, offset) => {
            frag.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
            const mark = document.createElement("mark");
            mark.textContent = match;
            frag.appendChild(mark);
            lastIndex = offset + match.length;
          });
          frag.appendChild(document.createTextNode(text.slice(lastIndex)));
          el.replaceChild(frag, node);
          risultati++;
        }
      }
    });
  });

  return risultati;
}

// Eventi

document.getElementById("search-btn").addEventListener("click", () => {
  const input = document.getElementById("search-input").value;
  cercaTesto(input);
});

document.getElementById("search-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    cercaTesto(e.target.value);
  }
});

 const btnClear = document.getElementById('clear-btn');
btnClear.addEventListener('click', () => {
  const inputRicerca = document.getElementById('search-input');
  inputRicerca.value = '';
  clearHighlights();
});

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
