const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
const copy = document.querySelector('.copy-btn');
const status = document.getElementById('status');
const french = document.documentElement.lang === 'fr';
const originalIcon = copy.innerHTML;
let selected = 0;
let resetTimer;

function resetCopy() {
  clearTimeout(resetTimer);
  copy.innerHTML = originalIcon;
  status.textContent = '';
}

function selectTab(index) {
  selected = index;
  resetCopy();
  tabs.forEach((tab, i) => {
    const active = index === i;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    panels[i].hidden = !active;
  });
}

tabs.forEach((tab, i) => {
  const panel = panels[i];
  panel.querySelector('h3').hidden = true;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', tab.id);
  panel.tabIndex = 0;
  tab.addEventListener('click', () => selectTab(i));
  tab.addEventListener('keydown', event => {
    const indices = {
      ArrowRight: (i + 1) % tabs.length,
      ArrowLeft: (i + tabs.length - 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1
    };
    if (!(event.key in indices)) return;
    event.preventDefault();
    const next = indices[event.key];
    selectTab(next);
    tabs[next].focus();
  });
});
selectTab(0);
document.querySelector('.terminal-top').hidden = false;
copy.hidden = !navigator.clipboard;
copy.addEventListener('click', async () => {
  const panel = panels[selected];
  const code = panel.querySelector('pre code');
  try {
    await navigator.clipboard.writeText(code.textContent);
    if (panel.hidden) return;
    copy.textContent = '✓';
    status.textContent = french ? 'Exemple copié.' : 'Example copied.';
    clearTimeout(resetTimer);
    resetTimer = setTimeout(resetCopy, 2000);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = french ? 'Code sélectionné pour la copie.' : 'Code selected for copying.';
  }
});
