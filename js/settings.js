/**
 * Power-User Settings & Customization Service
 */
const DEFAULT_SETTINGS = {
  theme: 'aurora',
  customBgUrl: '',
  customColor: '#0b0f19',
  bgType: 'wallpaper', // 'wallpaper' or 'solid'
  bgBlur: 0,
  bgBrightness: 90,
  userName: 'Ranjit',
  clockStyle: 'minimal', // 'minimal', 'glass', 'digital', 'editorial', 'bento'
  timeFormat: '12', // '12' or '24'
  showSeconds: false,
  searchEngine: 'google',
  openLinksNewTab: true,
  weatherUnit: 'c',
  // Pomodoro
  timerFocusMins: 25,
  timerShortBreakMins: 5,
  timerLongBreakMins: 15,
  timerSound: 'haptic', // 'haptic', 'marimba', 'bell', 'zen', 'silent'
  timerAutoStart: false,
  // Footer Tip
  dismissedFooterTip: false,
  // Widget visibilities
  showWeather: true,
  showTimer: true,
  showSounds: true,
  showClock: true,
  showGreeting: true,
  showSearch: true,
  showShortcuts: true,
  showQuotes: true,
  showTodos: true,
  showNotes: true,
  showFooter: true,
  showHeader: true
};

const SEARCH_ENGINES = {
  google: { name: 'Google', url: 'https://www.google.com/search?q=' },
  duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  bing: { name: 'Bing', url: 'https://www.bing.com/search?q=' },
  brave: { name: 'Brave', url: 'https://search.brave.com/search?q=' },
  perplexity: { name: 'Perplexity', url: 'https://www.perplexity.ai/search?q=' },
  youtube: { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=' },
  github: { name: 'GitHub', url: 'https://github.com/search?q=' },
  reddit: { name: 'Reddit', url: 'https://www.reddit.com/search/?q=' }
};

// 22 Curated High-Definition / 4K Wallpapers
const WALLPAPER_PRESETS = {
  // Local high-res generated
  aurora: { name: 'Cosmic Aurora', category: 'nature', url: 'assets/wallpapers/aurora.jpg' },
  sunset: { name: 'Serene Sunset', category: 'nature', url: 'assets/wallpapers/sunset.jpg' },
  glass: { name: 'Crystal Waves', category: 'abstract', url: 'assets/wallpapers/glass.jpg' },
  
  // Nature 4K
  mountain_mist: { name: 'Alpine Peaks', category: 'nature', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=3840&q=85' },
  redwood_forest: { name: 'Misty Redwoods', category: 'nature', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=3840&q=85' },
  iceland_waterfall: { name: 'Nordic Cascade', category: 'nature', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=3840&q=85' },
  desert_dunes: { name: 'Sahara Twilight', category: 'nature', url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=3840&q=85' },
  lake_reflection: { name: 'Glacial Reflection', category: 'nature', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=3840&q=85' },
  fuji_dusk: { name: 'Mount Fuji Dusk', category: 'nature', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=3840&q=85' },

  // Cosmic & Space 4K
  space_deep: { name: 'Deep Nebula', category: 'space', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=3840&q=85' },
  earth_orbit: { name: 'Earth Atmosphere', category: 'space', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=3840&q=85' },
  starry_ridge: { name: 'Milky Way Ridge', category: 'space', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=3840&q=85' },
  eclipse_corona: { name: 'Solar Corona', category: 'space', url: 'https://images.unsplash.com/photo-1532798369041-b33eb577ef1a?auto=format&fit=crop&w=3840&q=85' },

  // Cyberpunk & Urban 4K
  tokyo_rain: { name: 'Shinjuku Rain', category: 'urban', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=3840&q=85' },
  shanghai_skyline: { name: 'Shanghai Dusk', category: 'urban', url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=3840&q=85' },
  cyberpunk_alley: { name: 'Neon Backstreet', category: 'urban', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=3840&q=85' },
  
  // Minimalist, Architecture & Abstract 4K
  concrete_bauhaus: { name: 'Bauhaus Shadows', category: 'minimal', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=3840&q=85' },
  zen_pavilion: { name: 'Kyoto Pavilion', category: 'minimal', url: 'https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?auto=format&fit=crop&w=3840&q=85' },
  nordic_cabin: { name: 'Nordic Solitude', category: 'minimal', url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=3840&q=85' },
  abstract_topography: { name: 'Slate Topography', category: 'abstract', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=3840&q=85' },
  liquid_chrome: { name: 'Fluid Chrome', category: 'abstract', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=3840&q=85' },
  velvet_gradient: { name: 'Velvet Gradient', category: 'abstract', url: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)' }
};

// Curated Solid Colors
const SOLID_COLOR_PRESETS = [
  { name: 'OLED Black', hex: '#000000' },
  { name: 'Space Slate', hex: '#0b0f19' },
  { name: 'Midnight Navy', hex: '#0c1527' },
  { name: 'Charcoal Dark', hex: '#18181b' },
  { name: 'Deep Emerald', hex: '#062319' },
  { name: 'Velvet Plum', hex: '#1e1028' },
  { name: 'Warm Espresso', hex: '#1c1410' },
  { name: 'Light Pearl', hex: '#f1f5f9' }
];

class SettingsManager {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.bgLayer = document.getElementById('bg-layer');
    this.dropdowns = {};
  }

  async init() {
    const saved = await window.StorageService.get('settings');
    this.settings = { ...DEFAULT_SETTINGS, ...(saved.settings || {}) };
    this.applySettings();
    this.initSettingsModal();
    this.initFooterTipBanner();
  }

  applySettings() {
    this.applyBackground();
    this.applyWidgetVisibilities();

    if (window.ClockWidget) {
      window.ClockWidget.applyStyle(this.settings.clockStyle || 'minimal');
    }

    if (window.WeatherWidget) {
      window.WeatherWidget.unit = this.settings.weatherUnit;
    }

    if (window.FocusTimer) {
      window.FocusTimer.syncFromSettings();
    }
  }

  applyBackground() {
    if (!this.bgLayer) return;

    if (this.settings.bgType === 'solid') {
      this.bgLayer.style.background = this.settings.customColor || '#0b0f19';
      this.bgLayer.style.filter = 'none';
      this.bgLayer.style.transform = 'scale(1)';
      return;
    }

    const theme = this.settings.theme;
    let bgValue = '';

    if (theme === 'custom' && this.settings.customBgUrl) {
      bgValue = `url("${this.settings.customBgUrl}") center / cover no-repeat`;
    } else if (WALLPAPER_PRESETS[theme]) {
      const preset = WALLPAPER_PRESETS[theme].url;
      if (preset.startsWith('linear-gradient')) {
        bgValue = preset;
      } else {
        bgValue = `url("${preset}") center / cover no-repeat`;
      }
    } else {
      bgValue = `url("${WALLPAPER_PRESETS.aurora.url}") center / cover no-repeat`;
    }

    this.bgLayer.style.background = bgValue;
    this.bgLayer.style.filter = `blur(${this.settings.bgBlur}px) brightness(${this.settings.bgBrightness}%)`;
    this.bgLayer.style.transform = this.settings.bgBlur > 0 ? 'scale(1.05)' : 'scale(1)';
  }

  applyWidgetVisibilities() {
    const mapping = {
      'weather-widget': this.settings.showWeather,
      'timer-pill-btn': this.settings.showTimer,
      'sounds-toggle-btn': this.settings.showSounds,
      'clock-section': this.settings.showClock,
      'greeting-section': this.settings.showGreeting,
      'search-container': this.settings.showSearch,
      'shortcuts-container': this.settings.showShortcuts,
      'quote-container': this.settings.showQuotes,
      'todo-toggle-btn': this.settings.showTodos,
      'notes-toggle-btn': this.settings.showNotes,
      'bottom-footer': this.settings.showFooter !== false,
      'top-header': this.settings.showHeader !== false
    };

    for (const [id, visible] of Object.entries(mapping)) {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = visible ? '' : 'none';
      }
    }
  }

  initSettingsModal() {
    // Tab switching in full window settings
    const tabBtns = document.querySelectorAll('.settings-tab-btn');
    const tabPanes = document.querySelectorAll('.settings-tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        const targetPane = document.getElementById(`tab-pane-${tabId}`);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    this.renderWallpapersGrid();
    this.renderSolidColors();
    this.bindInputs();
  }

  renderWallpapersGrid() {
    const container = document.getElementById('wallpapers-gallery');
    if (!container) return;

    container.innerHTML = '';
    Object.entries(WALLPAPER_PRESETS).forEach(([key, wp]) => {
      const card = document.createElement('div');
      card.className = `wallpaper-card ${this.settings.bgType === 'wallpaper' && this.settings.theme === key ? 'selected' : ''}`;
      card.dataset.theme = key;

      const bgStyle = wp.url.startsWith('linear-gradient') ? wp.url : `url("${wp.url}")`;
      card.style.background = bgStyle;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';

      card.innerHTML = `
        <span class="wallpaper-name">${wp.name}</span>
        <div class="wallpaper-badge">${wp.category.toUpperCase()}</div>
      `;

      card.addEventListener('click', async () => {
        this.settings.bgType = 'wallpaper';
        this.settings.theme = key;
        document.querySelectorAll('.wallpaper-card').forEach(c => c.classList.remove('selected'));
        document.querySelectorAll('.solid-color-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        await this.save();
        this.applyBackground();
      });

      container.appendChild(card);
    });
  }

  renderSolidColors() {
    const container = document.getElementById('solid-colors-grid');
    if (!container) return;

    container.innerHTML = '';
    SOLID_COLOR_PRESETS.forEach(color => {
      const card = document.createElement('div');
      card.className = `solid-color-card ${this.settings.bgType === 'solid' && this.settings.customColor === color.hex ? 'selected' : ''}`;
      card.style.backgroundColor = color.hex;
      card.title = color.name;
      card.innerHTML = `<span class="solid-color-label">${color.name}</span>`;

      card.addEventListener('click', async () => {
        this.settings.bgType = 'solid';
        this.settings.customColor = color.hex;
        document.querySelectorAll('.wallpaper-card').forEach(c => c.classList.remove('selected'));
        document.querySelectorAll('.solid-color-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        await this.save();
        this.applyBackground();
      });

      container.appendChild(card);
    });

    // Custom Color Picker input
    const picker = document.getElementById('custom-color-picker');
    if (picker) {
      picker.value = this.settings.customColor || '#0b0f19';
      picker.addEventListener('input', async (e) => {
        this.settings.bgType = 'solid';
        this.settings.customColor = e.target.value;
        document.querySelectorAll('.wallpaper-card').forEach(c => c.classList.remove('selected'));
        await this.save();
        this.applyBackground();
      });
    }
  }

  bindInputs() {
    // Custom wallpaper file upload
    const customBgInput = document.getElementById('custom-bg-input');
    if (customBgInput) {
      customBgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            this.settings.bgType = 'wallpaper';
            this.settings.theme = 'custom';
            this.settings.customBgUrl = event.target.result;
            document.querySelectorAll('.wallpaper-card').forEach(t => t.classList.remove('selected'));
            await this.save();
            this.applyBackground();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Sliders
    const blurSlider = document.getElementById('slider-blur');
    const blurVal = document.getElementById('val-blur');
    if (blurSlider) {
      blurSlider.value = this.settings.bgBlur;
      if (blurVal) blurVal.textContent = `${this.settings.bgBlur}px`;
      blurSlider.addEventListener('input', async (e) => {
        this.settings.bgBlur = parseInt(e.target.value, 10);
        if (blurVal) blurVal.textContent = `${this.settings.bgBlur}px`;
        this.applyBackground();
        await this.save();
      });
    }

    const brightnessSlider = document.getElementById('slider-brightness');
    const brightnessVal = document.getElementById('val-brightness');
    if (brightnessSlider) {
      brightnessSlider.value = this.settings.bgBrightness;
      if (brightnessVal) brightnessVal.textContent = `${this.settings.bgBrightness}%`;
      brightnessSlider.addEventListener('input', async (e) => {
        this.settings.bgBrightness = parseInt(e.target.value, 10);
        if (brightnessVal) brightnessVal.textContent = `${this.settings.bgBrightness}%`;
        this.applyBackground();
        await this.save();
      });
    }

    // Name input
    const nameInput = document.getElementById('setting-name-input');
    if (nameInput) {
      nameInput.value = this.settings.userName;
      nameInput.addEventListener('change', async (e) => {
        this.settings.userName = e.target.value.trim() || 'Friend';
        await this.save();
        window.AuraApp?.updateGreeting();
      });
    }

    // Dropdowns
    if (window.CustomDropdown) {
      // Clock Style
      const clockStyleContainer = document.getElementById('dropdown-clock-style');
      if (clockStyleContainer) {
        this.dropdowns.clockStyle = new window.CustomDropdown({
          container: clockStyleContainer,
          value: this.settings.clockStyle || 'minimal',
          items: [
            { value: 'minimal', label: '1. macOS Minimal' },
            { value: 'glass', label: '2. Glass Capsule' },
            { value: 'digital', label: '3. Cyber Monospace' },
            { value: 'editorial', label: '4. Editorial Serif' },
            { value: 'bento', label: '5. Bento Stack' }
          ],
          onChange: async (val) => {
            this.settings.clockStyle = val;
            await this.save();
            window.ClockWidget?.applyStyle(val);
          }
        });
      }

      // Time Format
      const timeFormatContainer = document.getElementById('dropdown-time-format');
      if (timeFormatContainer) {
        this.dropdowns.timeFormat = new window.CustomDropdown({
          container: timeFormatContainer,
          value: this.settings.timeFormat || '12',
          items: [
            { value: '12', label: '12-Hour (AM/PM)' },
            { value: '24', label: '24-Hour (Military)' }
          ],
          onChange: async (val) => {
            this.settings.timeFormat = val;
            await this.save();
            window.ClockWidget?.tick(true);
          }
        });
      }

      // Timer Chime Sound (Office-Safe & Discreet)
      const timerSoundContainer = document.getElementById('dropdown-timer-sound');
      if (timerSoundContainer) {
        this.dropdowns.timerSound = new window.CustomDropdown({
          container: timerSoundContainer,
          value: this.settings.timerSound || 'haptic',
          items: [
            { value: 'haptic', label: 'Discreet Tap (Office-Safe)' },
            { value: 'marimba', label: 'Soft Marimba (Acoustic)' },
            { value: 'bell', label: 'Muted Bell (Soft)' },
            { value: 'zen', label: 'Gentle Zen (Calm)' },
            { value: 'silent', label: 'Silent (Visual Only)' }
          ],
          onChange: async (val) => {
            this.settings.timerSound = val;
            await this.save();
            window.SoundscapeEngine?.playChime(val);
          }
        });
      }

      // Search Engine
      const searchEngineContainer = document.getElementById('dropdown-setting-search-engine');
      if (searchEngineContainer) {
        this.dropdowns.searchEngine = new window.CustomDropdown({
          container: searchEngineContainer,
          value: this.settings.searchEngine || 'google',
          items: Object.entries(SEARCH_ENGINES).map(([k, v]) => ({ value: k, label: v.name })),
          onChange: async (val) => {
            this.settings.searchEngine = val;
            await this.save();
            window.AuraApp?.updateSearchEngine(val);
          }
        });
      }

      // Weather Unit
      const tempUnitContainer = document.getElementById('dropdown-temp-unit');
      if (tempUnitContainer) {
        this.dropdowns.weatherUnit = new window.CustomDropdown({
          container: tempUnitContainer,
          value: this.settings.weatherUnit || 'c',
          items: [
            { value: 'c', label: 'Celsius (°C)' },
            { value: 'f', label: 'Fahrenheit (°F)' }
          ],
          onChange: async (val) => {
            this.settings.weatherUnit = val;
            await this.save();
            window.WeatherWidget?.init();
          }
        });
      }
    }

    // Timer Custom Durations
    const focusMinsInput = document.getElementById('setting-focus-mins');
    if (focusMinsInput) {
      focusMinsInput.value = this.settings.timerFocusMins || 25;
      focusMinsInput.addEventListener('change', async (e) => {
        this.settings.timerFocusMins = Math.max(1, parseInt(e.target.value, 10) || 25);
        await this.save();
        window.FocusTimer?.syncFromSettings();
      });
    }

    const shortBreakInput = document.getElementById('setting-short-break-mins');
    if (shortBreakInput) {
      shortBreakInput.value = this.settings.timerShortBreakMins || 5;
      shortBreakInput.addEventListener('change', async (e) => {
        this.settings.timerShortBreakMins = Math.max(1, parseInt(e.target.value, 10) || 5);
        await this.save();
        window.FocusTimer?.syncFromSettings();
      });
    }

    const longBreakInput = document.getElementById('setting-long-break-mins');
    if (longBreakInput) {
      longBreakInput.value = this.settings.timerLongBreakMins || 15;
      longBreakInput.addEventListener('change', async (e) => {
        this.settings.timerLongBreakMins = Math.max(1, parseInt(e.target.value, 10) || 15);
        await this.save();
        window.FocusTimer?.syncFromSettings();
      });
    }

    // Timer Auto Start Toggle
    const timerAutoToggle = document.getElementById('toggle-timer-autostart');
    if (timerAutoToggle) {
      timerAutoToggle.checked = !!this.settings.timerAutoStart;
      timerAutoToggle.addEventListener('change', async (e) => {
        this.settings.timerAutoStart = e.target.checked;
        await this.save();
      });
    }

    // Seconds Toggle
    const secondsToggle = document.getElementById('toggle-seconds');
    if (secondsToggle) {
      secondsToggle.checked = this.settings.showSeconds;
      secondsToggle.addEventListener('change', async (e) => {
        this.settings.showSeconds = e.target.checked;
        await this.save();
        window.ClockWidget?.tick(true);
      });
    }

    // Open Links in New Tab Toggle
    const openLinksToggle = document.getElementById('toggle-open-links-newtab');
    if (openLinksToggle) {
      openLinksToggle.checked = this.settings.openLinksNewTab;
      openLinksToggle.addEventListener('change', async (e) => {
        this.settings.openLinksNewTab = e.target.checked;
        await this.save();
      });
    }

    // Widget visibility toggles
    const widgetToggles = [
      { id: 'toggle-widget-weather', key: 'showWeather' },
      { id: 'toggle-widget-timer', key: 'showTimer' },
      { id: 'toggle-widget-sounds', key: 'showSounds' },
      { id: 'toggle-widget-clock', key: 'showClock' },
      { id: 'toggle-widget-greeting', key: 'showGreeting' },
      { id: 'toggle-widget-search', key: 'showSearch' },
      { id: 'toggle-widget-shortcuts', key: 'showShortcuts' },
      { id: 'toggle-widget-quotes', key: 'showQuotes' },
      { id: 'toggle-widget-todos', key: 'showTodos' },
      { id: 'toggle-widget-notes', key: 'showNotes' },
      { id: 'toggle-widget-footer', key: 'showFooter' },
      { id: 'toggle-widget-header', key: 'showHeader' }
    ];

    widgetToggles.forEach(({ id, key }) => {
      const toggle = document.getElementById(id);
      if (toggle) {
        toggle.checked = this.settings[key] !== false;
        toggle.addEventListener('change', async (e) => {
          this.settings[key] = e.target.checked;
          this.applyWidgetVisibilities();
          await this.save();
        });
      }
    });

    // Open Chrome Appearance Settings Button
    const openAppearanceBtn = document.getElementById('btn-open-appearance');
    if (openAppearanceBtn) {
      openAppearanceBtn.addEventListener('click', () => {
        try {
          if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
            chrome.tabs.create({ url: 'chrome://settings/appearance' });
          } else {
            window.open('chrome://settings/appearance', '_blank');
          }
        } catch (e) {
          window.open('chrome://settings/appearance', '_blank');
        }
      });
    }

    // Footer Native Bar Tip Button
    const showFooterTipBtn = document.getElementById('btn-show-footer-tip');
    if (showFooterTipBtn) {
      showFooterTipBtn.addEventListener('click', () => {
        const banner = document.getElementById('footer-tip-banner');
        if (banner) {
          banner.style.display = 'flex';
          banner.classList.add('visible');
          // Close settings window so user can clearly see the banner at bottom
          document.getElementById('settings-drawer')?.classList.remove('open');
          document.getElementById('modal-backdrop')?.classList.remove('active');
        }
      });
    }

    // Backup & Export JSON
    const exportBtn = document.getElementById('backup-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const jsonStr = JSON.stringify(this.settings, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newtab-settings-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    const importInput = document.getElementById('backup-import-input');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const imported = JSON.parse(event.target.result);
              this.settings = { ...DEFAULT_SETTINGS, ...imported };
              await this.save();
              location.reload();
            } catch (err) {
              if (window.showCustomAlert) {
                window.showCustomAlert('Import Error', 'The selected JSON file has an invalid format.');
              }
            }
          };
          reader.readAsText(file);
        }
      });
    }

    // Reset button
    const resetBtn = document.getElementById('backup-reset-btn') || document.getElementById('settings-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (window.showCustomConfirm) {
          window.showCustomConfirm(
            'Reset Preferences',
            'Are you sure you want to reset all preferences to their factory defaults? Your custom shortcuts will also be restored to default.',
            async () => {
              this.settings = { ...DEFAULT_SETTINGS };
              await this.save();
              location.reload();
            },
            true
          );
        }
      });
    }
  }

  initFooterTipBanner() {
    const banner = document.getElementById('footer-tip-banner');
    if (!banner) return;

    if (this.settings.dismissedFooterTip) {
      banner.style.display = 'none';
      return;
    }

    banner.classList.add('visible');

    const dismissBtns = [
      document.getElementById('footer-tip-got-it'),
      document.getElementById('footer-tip-close')
    ];

    dismissBtns.forEach(btn => {
      btn?.addEventListener('click', async () => {
        banner.classList.remove('visible');
        setTimeout(() => { banner.style.display = 'none'; }, 300);
        this.settings.dismissedFooterTip = true;
        await this.save();
      });
    });
  }

  async save() {
    await window.StorageService.set({ settings: this.settings });
  }
}

window.SettingsManager = new SettingsManager();
window.SEARCH_ENGINES = SEARCH_ENGINES;
window.WALLPAPER_PRESETS = WALLPAPER_PRESETS;
