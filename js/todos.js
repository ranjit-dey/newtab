/**
 * Aura Tab - Daily Focus & Todo Manager
 */
class TodoManager {
  constructor() {
    this.todos = [];
    this.filter = 'all';
    this.badgeEl = document.getElementById('todo-badge');
    this.listEl = document.getElementById('todo-list');
    this.inputEl = document.getElementById('todo-input');
    this.filterBtns = document.querySelectorAll('.todo-filter-btn');
    this.clearCompletedBtn = document.getElementById('todo-clear-completed');
    this.emptyStateEl = document.getElementById('todo-empty');
  }

  async init() {
    const data = await window.StorageService.get('todos');
    this.todos = data.todos || [
      { id: '1', text: 'Plan top 3 daily priorities', done: false },
      { id: '2', text: 'Drink a glass of water', done: true },
      { id: '3', text: 'Deep work focus block (50 min)', done: false }
    ];

    if (this.inputEl) {
      this.inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && this.inputEl.value.trim()) {
          this.addTodo(this.inputEl.value.trim());
          this.inputEl.value = '';
        }
      });
    }

    if (this.clearCompletedBtn) {
      this.clearCompletedBtn.addEventListener('click', () => {
        this.clearCompleted();
      });
    }

    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filter = btn.dataset.filter;
        this.render();
      });
    });

    this.render();
  }

  updateBadge() {
    const activeCount = this.todos.filter(t => !t.done).length;
    if (this.badgeEl) {
      if (activeCount > 0) {
        this.badgeEl.textContent = activeCount;
        this.badgeEl.style.display = 'inline-flex';
      } else {
        this.badgeEl.style.display = 'none';
      }
    }
  }

  render() {
    if (!this.listEl) return;
    this.listEl.innerHTML = '';

    const filtered = this.todos.filter(t => {
      if (this.filter === 'active') return !t.done;
      if (this.filter === 'completed') return t.done;
      return true;
    });

    if (filtered.length === 0) {
      if (this.emptyStateEl) this.emptyStateEl.style.display = 'block';
    } else {
      if (this.emptyStateEl) this.emptyStateEl.style.display = 'none';
      filtered.forEach(todo => {
        const item = document.createElement('div');
        item.className = `todo-item ${todo.done ? 'is-done' : ''}`;
        item.innerHTML = `
          <label class="todo-checkbox-wrapper">
            <input type="checkbox" ${todo.done ? 'checked' : ''} data-id="${todo.id}" />
            <span class="custom-checkbox">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </label>
          <span class="todo-text">${this.escapeHtml(todo.text)}</span>
          <button class="todo-del-btn" title="Delete" data-id="${todo.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        `;

        const check = item.querySelector('input');
        check.addEventListener('change', () => {
          this.toggleTodo(todo.id);
        });

        const del = item.querySelector('.todo-del-btn');
        del.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deleteTodo(todo.id);
        });

        this.listEl.appendChild(item);
      });
    }

    const hasCompleted = this.todos.some(t => t.done);
    if (this.clearCompletedBtn) {
      this.clearCompletedBtn.style.display = hasCompleted ? 'inline-block' : 'none';
    }

    this.updateBadge();
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  async addTodo(text) {
    this.todos.unshift({
      id: Date.now().toString(),
      text: text,
      done: false
    });
    await this.save();
    this.render();
  }

  async toggleTodo(id) {
    const t = this.todos.find(item => item.id === id);
    if (t) {
      t.done = !t.done;
      await this.save();
      this.render();
    }
  }

  async deleteTodo(id) {
    this.todos = this.todos.filter(item => item.id !== id);
    await this.save();
    this.render();
  }

  async clearCompleted() {
    this.todos = this.todos.filter(item => !item.done);
    await this.save();
    this.render();
  }

  async save() {
    await window.StorageService.set({ todos: this.todos });
  }
}

window.TodoManager = new TodoManager();
