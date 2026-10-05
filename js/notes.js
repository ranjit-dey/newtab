/**
 * Advanced Multi-Note Taker with Inline Renaming, Instant Autosave, and Deletion
 */
class QuickNotes {
  constructor() {
    this.notes = [];
    this.activeNoteId = null;
    this.debounceTimer = null;

    this.drawer = document.getElementById('notes-drawer');
    this.tabsBar = document.getElementById('notes-tabs-bar');
    this.titleInput = document.getElementById('note-title-input');
    this.textarea = document.getElementById('notes-textarea');
    this.statsEl = document.getElementById('notes-stats');
    this.statusHint = document.getElementById('note-status-hint');
    this.countBadge = document.getElementById('notes-count-badge');
    this.newBtn = document.getElementById('notes-new-btn');
    this.copyBtn = document.getElementById('notes-copy-btn');
    this.delBtn = document.getElementById('notes-delete-btn');
    this.closeBtn = document.getElementById('notes-close-btn');
  }

  async init() {
    const data = await window.StorageService.get(['notesList', 'activeNoteId', 'quickNotes']);

    if (Array.isArray(data.notesList) && data.notesList.length > 0) {
      this.notes = data.notesList;
      this.activeNoteId = data.activeNoteId || this.notes[0].id;
    } else {
      // Migrate legacy single note or seed default note
      const initialContent = typeof data.quickNotes === 'string' && data.quickNotes.trim()
        ? data.quickNotes
        : 'Welcome to your Notes! You can create multiple notes, rename them inline, and they save automatically.';

      const defaultNote = {
        id: 'note_' + Date.now(),
        title: 'Quick Thoughts',
        content: initialContent,
        updatedAt: Date.now()
      };
      this.notes = [defaultNote];
      this.activeNoteId = defaultNote.id;
      await this.persist();
    }

    // Ensure valid active note
    if (!this.notes.some(n => n.id === this.activeNoteId)) {
      this.activeNoteId = this.notes[0]?.id || null;
    }

    this.bindEvents();
    this.renderTabs();
    this.loadActiveNote();
  }

  bindEvents() {
    if (this.newBtn) {
      this.newBtn.addEventListener('click', () => this.createNote());
    }

    if (this.delBtn) {
      this.delBtn.addEventListener('click', () => this.deleteActiveNote());
    }

    if (this.copyBtn) {
      this.copyBtn.addEventListener('click', () => this.copyActiveNote());
    }

    if (this.titleInput) {
      this.titleInput.addEventListener('input', () => {
        const active = this.getActiveNote();
        if (active) {
          active.title = this.titleInput.value.trim() || 'Untitled Note';
          active.updatedAt = Date.now();
          this.updateTabTitle(active.id, active.title);
          this.triggerAutosave();
        }
      });
    }

    if (this.textarea) {
      this.textarea.addEventListener('input', () => {
        const active = this.getActiveNote();
        if (active) {
          active.content = this.textarea.value;
          active.updatedAt = Date.now();
          this.updateStats();
          this.triggerAutosave();
        }
      });
    }
  }

  getActiveNote() {
    return this.notes.find(n => n.id === this.activeNoteId) || null;
  }

  createNote() {
    const newNote = {
      id: 'note_' + Date.now(),
      title: 'Note ' + (this.notes.length + 1),
      content: '',
      updatedAt: Date.now()
    };
    this.notes.unshift(newNote);
    this.activeNoteId = newNote.id;
    this.persist();
    this.renderTabs();
    this.loadActiveNote();
    if (this.titleInput) {
      this.titleInput.focus();
      this.titleInput.select();
    }
  }

  deleteActiveNote() {
    if (this.notes.length <= 1) {
      // Clear existing instead of deleting lone note
      const active = this.getActiveNote();
      if (active) {
        active.title = 'Quick Thoughts';
        active.content = '';
        active.updatedAt = Date.now();
        this.persist();
        this.renderTabs();
        this.loadActiveNote();
      }
      return;
    }

    const idx = this.notes.findIndex(n => n.id === this.activeNoteId);
    if (idx !== -1) {
      this.notes.splice(idx, 1);
      this.activeNoteId = this.notes[Math.max(0, idx - 1)]?.id || this.notes[0]?.id;
      this.persist();
      this.renderTabs();
      this.loadActiveNote();
    }
  }

  deleteNoteById(noteId, e) {
    if (e) e.stopPropagation();
    if (this.notes.length <= 1) {
      this.deleteActiveNote();
      return;
    }
    const idx = this.notes.findIndex(n => n.id === noteId);
    if (idx !== -1) {
      const wasActive = this.activeNoteId === noteId;
      this.notes.splice(idx, 1);
      if (wasActive) {
        this.activeNoteId = this.notes[0]?.id;
      }
      this.persist();
      this.renderTabs();
      if (wasActive) {
        this.loadActiveNote();
      }
    }
  }

  selectNote(noteId) {
    if (this.activeNoteId === noteId) return;
    this.activeNoteId = noteId;
    this.persist();
    this.renderTabs();
    this.loadActiveNote();
  }

  loadActiveNote() {
    const active = this.getActiveNote();
    if (!active) return;

    if (this.titleInput) {
      this.titleInput.value = active.title;
    }
    if (this.textarea) {
      this.textarea.value = active.content || '';
    }
    if (this.countBadge) {
      this.countBadge.textContent = `${this.notes.length} note${this.notes.length === 1 ? '' : 's'}`;
    }
    this.updateStats();
    if (this.statusHint) this.statusHint.textContent = 'Saved';
  }

  renderTabs() {
    if (!this.tabsBar) return;
    this.tabsBar.innerHTML = '';

    this.notes.forEach(note => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = `note-tab-btn ${note.id === this.activeNoteId ? 'active' : ''}`;
      tab.dataset.id = note.id;

      tab.innerHTML = `
        <span class="note-tab-title">${this.escapeHtml(note.title || 'Untitled')}</span>
        ${this.notes.length > 1 ? `
          <span class="note-tab-close" title="Delete note">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </span>
        ` : ''}
      `;

      tab.addEventListener('click', (e) => {
        if (e.target.closest('.note-tab-close')) {
          this.deleteNoteById(note.id, e);
        } else {
          this.selectNote(note.id);
        }
      });

      this.tabsBar.appendChild(tab);
    });

    if (this.countBadge) {
      this.countBadge.textContent = `${this.notes.length} note${this.notes.length === 1 ? '' : 's'}`;
    }
  }

  updateTabTitle(noteId, newTitle) {
    const tab = this.tabsBar?.querySelector(`.note-tab-btn[data-id="${noteId}"] .note-tab-title`);
    if (tab) {
      tab.textContent = newTitle || 'Untitled Note';
    }
  }

  updateStats() {
    if (!this.textarea || !this.statsEl) return;
    const text = this.textarea.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = this.textarea.value.length;
    this.statsEl.textContent = `${words} words • ${chars} chars`;
  }

  triggerAutosave() {
    if (this.statusHint) this.statusHint.textContent = 'Saving...';
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      await this.persist();
      if (this.statusHint) this.statusHint.textContent = 'Saved';
    }, 400);
  }

  async persist() {
    await window.StorageService.set({
      notesList: this.notes,
      activeNoteId: this.activeNoteId
    });
  }

  copyActiveNote() {
    const active = this.getActiveNote();
    if (!active) return;
    const fullText = `${active.title}\n\n${active.content}`;
    navigator.clipboard.writeText(fullText).then(() => {
      if (this.copyBtn) {
        const orig = this.copyBtn.textContent;
        this.copyBtn.textContent = 'Copied!';
        setTimeout(() => { this.copyBtn.textContent = orig; }, 1400);
      }
    });
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

window.QuickNotes = new QuickNotes();
