/**
 * Aura Tab - Scratchpad Quick Notes
 */
class QuickNotes {
  constructor() {
    this.textarea = document.getElementById('notes-textarea');
    this.statsEl = document.getElementById('notes-stats');
    this.copyBtn = document.getElementById('notes-copy-btn');
    this.clearBtn = document.getElementById('notes-clear-btn');
    this.debounceTimer = null;
  }

  async init() {
    const data = await window.StorageService.get('quickNotes');
    if (this.textarea) {
      this.textarea.value = data.quickNotes || '';
      this.updateStats();

      this.textarea.addEventListener('input', () => {
        this.updateStats();
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.save(), 400);
      });
    }

    if (this.copyBtn) {
      this.copyBtn.addEventListener('click', () => {
        if (!this.textarea) return;
        navigator.clipboard.writeText(this.textarea.value).then(() => {
          const original = this.copyBtn.textContent;
          this.copyBtn.textContent = 'Copied!';
          setTimeout(() => { this.copyBtn.textContent = original; }, 1500);
        });
      });
    }

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        if (confirm('Clear scratchpad notes?')) {
          if (this.textarea) this.textarea.value = '';
          this.save();
          this.updateStats();
        }
      });
    }
  }

  updateStats() {
    if (!this.textarea || !this.statsEl) return;
    const text = this.textarea.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = this.textarea.value.length;
    this.statsEl.textContent = `${words} words • ${chars} chars`;
  }

  async save() {
    if (!this.textarea) return;
    await window.StorageService.set({ quickNotes: this.textarea.value });
  }
}

window.QuickNotes = new QuickNotes();
