/**
 * Custom Modal Alerts & Confirms (Rule 5: No browser alert/confirm)
 */
window.showCustomAlert = (title, message) => {
  const modal = document.getElementById('custom-dialog-modal');
  const backdrop = document.getElementById('modal-backdrop');
  if (!modal) return;
  const titleEl = document.getElementById('custom-dialog-title');
  const msgEl = document.getElementById('custom-dialog-message');
  const iconEl = document.getElementById('custom-dialog-icon');
  const cancelBtn = document.getElementById('custom-dialog-cancel');
  const confirmBtn = document.getElementById('custom-dialog-confirm');

  if (titleEl) titleEl.textContent = title || 'Notice';
  if (msgEl) msgEl.textContent = message || '';

  if (iconEl) {
    iconEl.className = 'custom-dialog-badge badge-info';
    iconEl.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  if (cancelBtn) cancelBtn.style.display = 'none';
  if (confirmBtn) {
    confirmBtn.className = 'btn-dialog-primary';
    confirmBtn.textContent = 'OK';
    confirmBtn.onclick = () => {
      modal.classList.remove('open');
      backdrop?.classList.remove('active');
    };
  }
  const closeBtn = document.getElementById('custom-dialog-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.classList.remove('open');
      backdrop?.classList.remove('active');
    };
  }
  backdrop?.classList.add('active');
  modal.classList.add('open');
};

window.showCustomConfirm = (title, message, onConfirm, isDanger = false) => {
  const modal = document.getElementById('custom-dialog-modal');
  const backdrop = document.getElementById('modal-backdrop');
  if (!modal) return;
  const titleEl = document.getElementById('custom-dialog-title');
  const msgEl = document.getElementById('custom-dialog-message');
  const iconEl = document.getElementById('custom-dialog-icon');
  const cancelBtn = document.getElementById('custom-dialog-cancel');
  const confirmBtn = document.getElementById('custom-dialog-confirm');

  if (titleEl) titleEl.textContent = title || 'Confirm';
  if (msgEl) msgEl.textContent = message || '';

  const destructive = isDanger || /reset|delete|remove|clear/i.test(title || '');
  if (iconEl) {
    if (destructive) {
      iconEl.className = 'custom-dialog-badge badge-danger';
      iconEl.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    } else {
      iconEl.className = 'custom-dialog-badge badge-info';
      iconEl.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }
  }

  if (cancelBtn) {
    cancelBtn.style.display = 'inline-flex';
    cancelBtn.onclick = () => {
      modal.classList.remove('open');
      backdrop?.classList.remove('active');
    };
  }
  if (confirmBtn) {
    confirmBtn.className = destructive ? 'btn-dialog-danger' : 'btn-dialog-primary';
    confirmBtn.textContent = destructive
      ? ((title || '').toLowerCase().includes('reset') ? 'Reset Everything' : ((title || '').toLowerCase().includes('delete') ? 'Delete' : 'Confirm'))
      : 'Confirm';
    confirmBtn.onclick = () => {
      modal.classList.remove('open');
      backdrop?.classList.remove('active');
      if (typeof onConfirm === 'function') onConfirm();
    };
  }
  const closeBtn = document.getElementById('custom-dialog-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.classList.remove('open');
      backdrop?.classList.remove('active');
    };
  }
  backdrop?.classList.add('active');
  modal.classList.add('open');
};

/**
 * Main Application Coordinator
 */
class MainApp {
  constructor() {
    this.greetingEl = document.getElementById('greeting-text');
    this.nameSpanEl = document.getElementById('user-name-display');
    this.searchInput = document.getElementById('search-input');
    this.searchForm = document.getElementById('search-form');
    this.voiceSearchBtn = document.getElementById('voice-search-btn');

    // Modals & Drawers
    this.settingsDrawer = document.getElementById('settings-drawer');
    this.notesDrawer = document.getElementById('notes-drawer');
    this.todoPanel = document.getElementById('todo-panel');
    this.timerModal = document.getElementById('timer-modal');
    this.soundsModal = document.getElementById('sounds-modal');
    this.addShortcutModal = document.getElementById('add-shortcut-modal');
    this.cityModal = document.getElementById('city-modal');
    this.modalBackdrop = document.getElementById('modal-backdrop');

    this.searchEngineDropdown = null;
  }

  async init() {
    // 1. Storage & Settings
    await window.SettingsManager.init();

    // 2. Animated 5-style Clock
    window.ClockWidget.init();

    // 3. Other widgets
    await window.WeatherWidget.init();
    await window.QuoteManager.init();
    await window.ShortcutManager.init();
    await window.TodoManager.init();
    window.FocusTimer.init();
    await window.QuickNotes.init();

    this.initGreeting();
    this.initSearchEngineDropdown();
    this.initSearch();
    this.initSoundscapesUI();
    this.initCityPicker();
    this.initAddShortcutModal();
    this.initDrawerTriggers();
    this.initKeyboardShortcuts();

    // Fade in page smoothly
    document.body.classList.add('app-loaded');
  }

  initGreeting() {
    this.updateGreeting();

    if (this.nameSpanEl) {
      this.nameSpanEl.addEventListener('click', () => {
        const currentName = window.SettingsManager.settings.userName || 'Friend';
        const newName = prompt('What is your name?', currentName);
        if (newName !== null && newName.trim() !== '') {
          window.SettingsManager.settings.userName = newName.trim();
          window.SettingsManager.save();
          this.updateGreeting();
          const settingInput = document.getElementById('setting-name-input');
          if (settingInput) settingInput.value = newName.trim();
        }
      });
    }
  }

  updateGreeting() {
    const hour = new Date().getHours();
    let salutation = 'Good day';
    if (hour >= 5 && hour < 12) salutation = 'Good morning';
    else if (hour >= 12 && hour < 17) salutation = 'Good afternoon';
    else if (hour >= 17 && hour < 22) salutation = 'Good evening';
    else salutation = 'Good night';

    const userName = window.SettingsManager?.settings?.userName || 'Friend';
    if (this.greetingEl) this.greetingEl.textContent = `${salutation}, `;
    if (this.nameSpanEl) this.nameSpanEl.textContent = userName;
  }

  initSearchEngineDropdown() {
    const container = document.getElementById('search-engine-custom-container');
    if (!container || !window.CustomDropdown) return;

    const engineItems = [
      { value: 'google', label: 'Google' },
      { value: 'duckduckgo', label: 'DuckDuckGo' },
      { value: 'bing', label: 'Bing' },
      { value: 'brave', label: 'Brave' },
      { value: 'perplexity', label: 'Perplexity' },
      { value: 'youtube', label: 'YouTube' },
      { value: 'github', label: 'GitHub' },
      { value: 'reddit', label: 'Reddit' }
    ];

    this.searchEngineDropdown = new window.CustomDropdown({
      container: container,
      items: engineItems,
      value: window.SettingsManager.settings.searchEngine || 'google',
      onChange: async (val) => {
        window.SettingsManager.settings.searchEngine = val;
        await window.SettingsManager.save();
        if (window.SettingsManager.dropdowns?.searchEngine) {
          window.SettingsManager.dropdowns.searchEngine.setValue(val);
        }
      }
    });
  }

  updateSearchEngine(val) {
    if (this.searchEngineDropdown) {
      this.searchEngineDropdown.setValue(val);
    }
  }

  initSearch() {
    if (this.searchForm) {
      this.searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = this.searchInput.value.trim();
        if (!query) return;

        // Check if query is directly a URL
        if (/^(https?:\/\/|www\.)[^\s/$.?#].[^\s]*$/i.test(query) || /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(query)) {
          let target = query;
          if (!target.startsWith('http://') && !target.startsWith('https://')) {
            target = 'https://' + target;
          }
          window.location.href = target;
          return;
        }

        const engineKey = window.SettingsManager?.settings?.searchEngine || 'google';
        const engine = window.SEARCH_ENGINES[engineKey] || window.SEARCH_ENGINES.google;
        window.location.href = `${engine.url}${encodeURIComponent(query)}`;
      });
    }

    // Voice Search with proper microphone permission handling
    if (this.voiceSearchBtn) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        let recognition = null;
        let isListening = false;
        const originalPlaceholder = this.searchInput ? this.searchInput.placeholder : 'Search the web or type a URL...';

        const stopListening = () => {
          isListening = false;
          this.voiceSearchBtn.classList.remove('listening');
          if (this.searchInput) this.searchInput.placeholder = originalPlaceholder;
          if (recognition) {
            try { recognition.stop(); } catch (e) {}
          }
        };

        this.voiceSearchBtn.addEventListener('click', async () => {
          if (isListening) {
            stopListening();
            return;
          }

          // Request microphone access
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              stream.getTracks().forEach(track => track.stop());
            } catch (err) {
              console.warn('Microphone permission error:', err);
              window.showCustomAlert('Microphone Access', 'Microphone permission is required for voice search. Please enable microphone access in your browser settings.');
              return;
            }
          }

          try {
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = navigator.language || 'en-US';

            recognition.onstart = () => {
              isListening = true;
              this.voiceSearchBtn.classList.add('listening');
              if (this.searchInput) {
                this.searchInput.placeholder = 'Listening... Speak now';
                this.searchInput.focus();
              }
            };

            recognition.onresult = (event) => {
              const transcript = event.results[0][0].transcript;
              if (this.searchInput) {
                this.searchInput.value = transcript;
                this.searchForm.requestSubmit();
              }
              stopListening();
            };

            recognition.onerror = (e) => {
              console.warn('Speech recognition error:', e.error);
              stopListening();
              if (e.error === 'not-allowed') {
                window.showCustomAlert('Microphone Blocked', 'Microphone access was blocked. Please enable it in browser settings.');
              }
            };

            recognition.onend = () => {
              stopListening();
            };

            recognition.start();
          } catch (e) {
            console.warn('SpeechRecognition start failed:', e);
            stopListening();
          }
        });
      } else {
        this.voiceSearchBtn.style.display = 'none';
      }
    }
  }

  initSoundscapesUI() {
    const soundBtns = document.querySelectorAll('.sound-chip');
    const playPauseBtn = document.getElementById('sound-play-toggle');
    const volSlider = document.getElementById('sound-volume-slider');

    soundBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const soundType = btn.dataset.sound;
        soundBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        switch (soundType) {
          case 'rain': window.SoundscapeEngine.playRain(); break;
          case 'waves': window.SoundscapeEngine.playWaves(); break;
          case 'campfire': window.SoundscapeEngine.playCampfire(); break;
          case 'noise': window.SoundscapeEngine.playBrownNoise(); break;
        }
        if (playPauseBtn) playPauseBtn.textContent = 'Pause Sound';
        document.getElementById('sounds-toggle-btn')?.classList.add('playing');
      });
    });

    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        if (window.SoundscapeEngine.isPlaying) {
          window.SoundscapeEngine.stop();
          soundBtns.forEach(b => b.classList.remove('active'));
          playPauseBtn.textContent = 'Play';
          document.getElementById('sounds-toggle-btn')?.classList.remove('playing');
        } else {
          window.SoundscapeEngine.playRain();
          soundBtns[0]?.classList.add('active');
          playPauseBtn.textContent = 'Pause Sound';
          document.getElementById('sounds-toggle-btn')?.classList.add('playing');
        }
      });
    }

    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        window.SoundscapeEngine.setVolume(parseFloat(e.target.value));
      });
    }
  }

  initDrawerTriggers() {
    // Backdrop
    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', () => this.closeAllModals());
    }

    // Settings
    document.getElementById('settings-toggle-btn')?.addEventListener('click', () => this.toggleModal(this.settingsDrawer));
    document.getElementById('settings-close-btn')?.addEventListener('click', () => this.closeModal(this.settingsDrawer));

    // Notes
    document.getElementById('notes-toggle-btn')?.addEventListener('click', () => this.toggleModal(this.notesDrawer));
    document.getElementById('notes-close-btn')?.addEventListener('click', () => this.closeModal(this.notesDrawer));

    // Todo
    document.getElementById('todo-toggle-btn')?.addEventListener('click', () => this.toggleModal(this.todoPanel, false));
    document.getElementById('todo-close-btn')?.addEventListener('click', () => this.closeModal(this.todoPanel));

    // Focus Timer
    document.getElementById('timer-pill-btn')?.addEventListener('click', () => this.toggleModal(this.timerModal));
    document.getElementById('timer-close-btn')?.addEventListener('click', () => this.closeModal(this.timerModal));

    // Sounds
    document.getElementById('sounds-toggle-btn')?.addEventListener('click', () => this.toggleModal(this.soundsModal));
    document.getElementById('sounds-close-btn')?.addEventListener('click', () => this.closeModal(this.soundsModal));
  }

  toggleModal(modalEl, useBackdrop = true) {
    if (!modalEl) return;
    if (modalEl.classList.contains('open')) {
      this.closeModal(modalEl);
    } else {
      this.openModal(modalEl, useBackdrop);
    }
  }

  openModal(modalEl, useBackdrop = true) {
    if (!modalEl) return;
    modalEl.classList.add('open');
    if (useBackdrop && this.modalBackdrop) {
      this.modalBackdrop.classList.add('active');
    }
  }

  closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('open');
    const openModals = document.querySelectorAll('.modal-window.open, .drawer-panel.open');
    if (openModals.length === 0 && this.modalBackdrop) {
      this.modalBackdrop.classList.remove('active');
    }
  }

  closeAllModals() {
    document.querySelectorAll('.modal-window.open, .drawer-panel.open, .popover-panel.open').forEach(el => {
      el.classList.remove('open');
    });
    if (this.modalBackdrop) {
      this.modalBackdrop.classList.remove('active');
    }
  }

  initAddShortcutModal() {
    const modal = this.addShortcutModal;
    const form = document.getElementById('add-shortcut-form');
    const closeBtn = document.getElementById('add-shortcut-close');
    const titleInput = document.getElementById('shortcut-title-input');
    const urlInput = document.getElementById('shortcut-url-input');

    closeBtn?.addEventListener('click', () => this.closeModal(modal));

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = titleInput.value.trim();
      const url = urlInput.value.trim();
      if (url) {
        await window.ShortcutManager.addShortcut(title, url);
        titleInput.value = '';
        urlInput.value = '';
        this.closeModal(modal);
      }
    });
  }

  openAddShortcutModal() {
    this.openModal(this.addShortcutModal);
    setTimeout(() => {
      document.getElementById('shortcut-title-input')?.focus();
    }, 150);
  }

  initCityPicker() {
    const modal = this.cityModal;
    const searchInput = document.getElementById('city-search-input');
    const resultsContainer = document.getElementById('city-search-results');
    const closeBtn = document.getElementById('city-modal-close');
    const autoDetectBtn = document.getElementById('city-auto-detect-btn');
    let debounce;

    closeBtn?.addEventListener('click', () => this.closeModal(modal));

    autoDetectBtn?.addEventListener('click', async () => {
      await window.StorageService.remove('customLocation');
      window.WeatherWidget.detectLocation();
      this.closeModal(modal);
    });

    searchInput?.addEventListener('input', () => {
      clearTimeout(debounce);
      const query = searchInput.value.trim();
      if (query.length < 2) {
        if (resultsContainer) resultsContainer.innerHTML = '';
        return;
      }

      debounce = setTimeout(async () => {
        if (resultsContainer) resultsContainer.innerHTML = '<div class="city-loading">Searching...</div>';
        const results = await window.WeatherWidget.searchCity(query);
        if (!results || results.length === 0) {
          if (resultsContainer) resultsContainer.innerHTML = '<div class="city-no-results">No cities found</div>';
          return;
        }

        resultsContainer.innerHTML = '';
        results.forEach(city => {
          const item = document.createElement('div');
          item.className = 'city-result-item';
          const country = city.country ? `, ${city.country}` : '';
          const admin = city.admin1 ? ` (${city.admin1})` : '';
          item.textContent = `${city.name}${admin}${country}`;

          item.addEventListener('click', async () => {
            const loc = { lat: city.latitude, lon: city.longitude, name: city.name };
            await window.StorageService.set({ customLocation: loc });
            window.WeatherWidget.fetchWeather(loc.lat, loc.lon, loc.name);
            this.closeModal(modal);
          });

          resultsContainer.appendChild(item);
        });
      }, 350);
    });
  }

  openCityPicker() {
    this.openModal(this.cityModal);
    setTimeout(() => {
      document.getElementById('city-search-input')?.focus();
    }, 150);
  }

  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInput = activeTag === 'input' || activeTag === 'textarea';

      // Press '/' to focus search omnibar
      if (e.key === '/' && !isInput) {
        e.preventDefault();
        this.searchInput?.focus();
        this.searchInput?.select();
      }

      // Escape to close open modal / blur search
      if (e.key === 'Escape') {
        if (document.querySelectorAll('.modal-window.open, .drawer-panel.open, .popover-panel.open').length > 0) {
          this.closeAllModals();
        } else if (isInput) {
          document.activeElement.blur();
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.AuraApp = new MainApp();
  window.AuraApp.init();
});
