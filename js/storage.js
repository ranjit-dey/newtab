/**
 * Aura Tab - Unified Storage Service
 * Automatically bridges between chrome.storage.local and browser localStorage
 */
const StorageService = {
  isExtension: typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local,

  async get(keys, defaults = {}) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.get(keys, (items) => {
          const result = { ...defaults, ...(items || {}) };
          resolve(result);
        });
      });
    } else {
      const result = { ...defaults };
      const keyList = Array.isArray(keys) ? keys : [keys];
      for (const k of keyList) {
        try {
          const val = localStorage.getItem(`aura_${k}`);
          if (val !== null) {
            result[k] = JSON.parse(val);
          }
        } catch (e) {
          console.warn('Storage parsing error for', k, e);
        }
      }
      return result;
    }
  },

  async set(items) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.set(items, resolve);
      });
    } else {
      for (const [key, val] of Object.entries(items)) {
        try {
          localStorage.setItem(`aura_${key}`, JSON.stringify(val));
        } catch (e) {
          console.warn('Storage set error for', key, e);
        }
      }
      return Promise.resolve();
    }
  },

  async remove(keys) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.remove(keys, resolve);
      });
    } else {
      const keyList = Array.isArray(keys) ? keys : [keys];
      for (const k of keyList) {
        localStorage.removeItem(`aura_${k}`);
      }
      return Promise.resolve();
    }
  }
};

window.StorageService = StorageService;
