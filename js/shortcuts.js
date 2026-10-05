/**
 * Aura Tab - Speed Dial / Shortcuts Manager
 */
const DEFAULT_SHORTCUTS = [
  { id: '1', title: 'Google', url: 'https://www.google.com' },
  { id: '2', title: 'YouTube', url: 'https://www.youtube.com' },
  { id: '3', title: 'GitHub', url: 'https://www.github.com' },
  { id: '4', title: 'ChatGPT', url: 'https://chatgpt.com' },
  { id: '5', title: 'Reddit', url: 'https://www.reddit.com' },
  { id: '6', title: 'Twitter / X', url: 'https://x.com' },
  { id: '7', title: 'Wikipedia', url: 'https://www.wikipedia.org' },
  { id: '8', title: 'Spotify', url: 'https://open.spotify.com' }
];

class ShortcutManager {
  constructor() {
    this.container = document.getElementById('shortcuts-grid');
    this.shortcuts = [];
  }

  async init() {
    const data = await window.StorageService.get('shortcuts');
    this.shortcuts = data.shortcuts || DEFAULT_SHORTCUTS;
    this.render();
  }

  getFaviconUrl(url) {
    try {
      const hostname = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch (e) {
      return '';
    }
  }

  getDomainInitial(url, title) {
    if (title && title.length > 0) return title[0].toUpperCase();
    try {
      return new URL(url).hostname[0].toUpperCase();
    } catch (e) {
      return '★';
    }
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const openNewTab = window.SettingsManager?.settings?.openLinksNewTab !== false;

    this.shortcuts.forEach((sc) => {
      const card = document.createElement('a');
      card.href = sc.url;
      card.className = 'shortcut-item glass-interactive';
      card.title = sc.title;
      if (openNewTab) {
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
      }

      const faviconUrl = this.getFaviconUrl(sc.url);
      const initial = this.getDomainInitial(sc.url, sc.title);

      card.innerHTML = `
        <div class="shortcut-icon-wrapper">
          <img src="${faviconUrl}" alt="${sc.title}" class="shortcut-favicon" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
          <div class="shortcut-fallback" style="display:none;">${initial}</div>
        </div>
        <span class="shortcut-label">${sc.title}</span>
        <button class="shortcut-remove-btn" title="Remove shortcut" data-id="${sc.id}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;

      const removeBtn = card.querySelector('.shortcut-remove-btn');
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.removeShortcut(sc.id);
      });

      this.container.appendChild(card);
    });

    // Add "+" Button
    const addBtn = document.createElement('button');
    addBtn.className = 'shortcut-item shortcut-add-btn glass-interactive';
    addBtn.title = 'Add Shortcut';
    addBtn.innerHTML = `
      <div class="shortcut-icon-wrapper shortcut-add-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
      <span class="shortcut-label">Add Link</span>
    `;

    addBtn.addEventListener('click', () => {
      window.AuraApp?.openAddShortcutModal();
    });

    this.container.appendChild(addBtn);
  }

  async addShortcut(title, rawUrl) {
    let url = rawUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const newSc = {
      id: Date.now().toString(),
      title: title.trim() || new URL(url).hostname,
      url: url
    };
    this.shortcuts.push(newSc);
    await window.StorageService.set({ shortcuts: this.shortcuts });
    this.render();
  }

  async removeShortcut(id) {
    this.shortcuts = this.shortcuts.filter(sc => sc.id !== id);
    await window.StorageService.set({ shortcuts: this.shortcuts });
    this.render();
  }
}

window.ShortcutManager = new ShortcutManager();
