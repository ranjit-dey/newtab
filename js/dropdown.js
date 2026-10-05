/**
 * Custom Frosted Glass Dropdown Component
 * Clean, left-aligned, accessible select replacement with smooth micro-animations.
 */
class CustomDropdown {
  constructor(options) {
    this.container = typeof options.container === 'string' ? document.getElementById(options.container) : options.container;
    this.items = options.items || []; // Array of { value, label, icon }
    this.value = options.value || (this.items[0] ? this.items[0].value : '');
    this.onChange = options.onChange || (() => {});
    this.isOpen = false;

    this.render();
    this.bindEvents();
  }

  render() {
    if (!this.container) return;
    this.container.classList.add('custom-dropdown-root');

    const selectedItem = this.items.find(i => i.value === this.value) || this.items[0] || { label: '', value: '' };

    this.container.innerHTML = `
      <button type="button" class="custom-dropdown-trigger" aria-haspopup="listbox" aria-expanded="false">
        <span class="custom-dropdown-left-group">
          ${selectedItem.icon ? `<span class="custom-dropdown-current-icon">${selectedItem.icon}</span>` : ''}
          <span class="custom-dropdown-label">${selectedItem.label}</span>
        </span>
        <svg class="custom-dropdown-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="custom-dropdown-menu glass-card" role="listbox">
        ${this.items.map(item => `
          <div class="custom-dropdown-item ${item.value === this.value ? 'selected' : ''}" data-value="${item.value}" role="option" aria-selected="${item.value === this.value}">
            <div class="custom-dropdown-item-left">
              ${item.icon ? `<span class="custom-dropdown-item-icon">${item.icon}</span>` : ''}
              <span class="custom-dropdown-item-label">${item.label}</span>
            </div>
            <svg class="custom-dropdown-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        `).join('')}
      </div>
    `;

    this.trigger = this.container.querySelector('.custom-dropdown-trigger');
    this.menu = this.container.querySelector('.custom-dropdown-menu');
    this.labelEl = this.container.querySelector('.custom-dropdown-label');
    this.iconEl = this.container.querySelector('.custom-dropdown-current-icon');
  }

  bindEvents() {
    if (!this.trigger) return;

    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    this.menu.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.custom-dropdown-item');
      if (itemEl) {
        e.stopPropagation();
        const val = itemEl.dataset.value;
        this.setValue(val, true);
        this.close();
      }
    });

    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.close();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      document.querySelectorAll('.custom-dropdown-root.open').forEach(el => {
        if (el !== this.container) el.classList.remove('open');
      });
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.container.classList.add('open');
    this.trigger.setAttribute('aria-expanded', 'true');
  }

  close() {
    this.isOpen = false;
    this.container.classList.remove('open');
    this.trigger.setAttribute('aria-expanded', 'false');
  }

  setValue(val, triggerChange = false) {
    this.value = val;
    const selectedItem = this.items.find(i => i.value === this.value);
    if (selectedItem) {
      if (this.labelEl) this.labelEl.textContent = selectedItem.label;
      if (this.iconEl) this.iconEl.innerHTML = selectedItem.icon || '';
    }

    this.container.querySelectorAll('.custom-dropdown-item').forEach(el => {
      const isSelected = el.dataset.value === val;
      el.classList.toggle('selected', isSelected);
      el.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });

    if (triggerChange) {
      this.onChange(val);
    }
  }
}

window.CustomDropdown = CustomDropdown;
