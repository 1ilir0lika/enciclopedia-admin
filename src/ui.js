// ui.js

export default async function setupThemeToggle() {
  const toggleBtn = document.getElementById('toggle-theme');
  if (!toggleBtn) return;

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
}
