/**
 * Bulletproof Clock Widget with 5 Styles & Clean Vertical Slide Transitions
 * Prevents any string concatenation or ghost digit accumulation (e.g. 03:000102 pm)
 */
class ClockWidget {
  constructor() {
    this.container = document.getElementById('clock-section');
    this.hoursBox = document.getElementById('digit-hours-box');
    this.minutesBox = document.getElementById('digit-minutes-box');
    this.secondsBox = document.getElementById('digit-seconds-box');
    this.secondsWrapper = document.getElementById('clock-seconds-wrapper');
    this.ampmEl = document.getElementById('clock-ampm');
    this.dateEl = document.getElementById('clock-date');

    this.currentHours = null;
    this.currentMinutes = null;
    this.currentSeconds = null;
    this.style = 'minimal';
    this.timerId = null;
  }

  init() {
    const settings = window.SettingsManager?.settings;
    if (settings) {
      this.style = settings.clockStyle || 'minimal';
    }
    this.applyStyle(this.style);

    // Initial tick without animation
    this.tick(true);

    // Start interval
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => this.tick(false), 1000);

    // Tab visibility optimization: sync immediately upon tab waking
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.tick(true);
      }
    });
  }

  applyStyle(styleName) {
    this.style = styleName;
    if (!this.container) return;

    this.container.classList.remove(
      'clock-style-minimal',
      'clock-style-glass',
      'clock-style-digital',
      'clock-style-editorial',
      'clock-style-bento'
    );
    this.container.classList.add(`clock-style-${styleName}`);
  }

  tick(forceInstant = false) {
    const now = new Date();
    const settings = window.SettingsManager?.settings || { timeFormat: '12', showSeconds: false };
    const is12Hour = settings.timeFormat === '12';

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    let ampm = '';
    if (is12Hour) {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
    }

    const hoursStr = hours.toString().padStart(2, '0');
    const isBackgroundTab = document.hidden;
    const shouldSlide = !forceInstant && !isBackgroundTab;

    // Update Hours
    if (this.currentHours !== hoursStr) {
      this.updateDigit(this.hoursBox, hoursStr, shouldSlide);
      this.currentHours = hoursStr;
    }

    // Update Minutes (Only slide on actual minute change)
    if (this.currentMinutes !== minutes) {
      this.updateDigit(this.minutesBox, minutes, shouldSlide);
      this.currentMinutes = minutes;
    }

    // Update Seconds (Instantaneous update, never slide-up)
    if (settings.showSeconds) {
      if (this.secondsWrapper) this.secondsWrapper.style.display = 'inline-flex';
      if (this.secondsBox && this.currentSeconds !== seconds) {
        this.secondsBox.textContent = seconds;
        this.currentSeconds = seconds;
      }
    } else {
      if (this.secondsWrapper) this.secondsWrapper.style.display = 'none';
      if (this.secondsBox) this.secondsBox.textContent = '';
      this.currentSeconds = null;
    }

    // AM/PM Indicator
    if (this.ampmEl) {
      this.ampmEl.textContent = is12Hour ? ampm : '';
      this.ampmEl.style.display = is12Hour ? 'inline-block' : 'none';
    }

    // Date
    if (this.dateEl) {
      const options = { weekday: 'long', month: 'long', day: 'numeric' };
      this.dateEl.textContent = now.toLocaleDateString(undefined, options);
    }
  }

  /**
   * Butter-smooth digit update with absolute layers that never collapse box width or shift layout.
   */
  updateDigit(boxEl, newVal, allowSlide) {
    if (!boxEl) return;

    if (!allowSlide) {
      boxEl.innerHTML = `<span class="digit-slide-layer slide-active">${newVal}</span>`;
      return;
    }

    const activeLayer = boxEl.querySelector('.digit-slide-layer.slide-active');
    const oldVal = activeLayer ? activeLayer.textContent.trim() : boxEl.textContent.trim();

    if (oldVal === newVal) {
      if (!activeLayer) {
        boxEl.innerHTML = `<span class="digit-slide-layer slide-active">${newVal}</span>`;
      }
      return;
    }

    // Ensure we have a base active layer without clearing innerHTML
    if (!activeLayer) {
      boxEl.innerHTML = `<span class="digit-slide-layer slide-active">${oldVal || newVal}</span>`;
    }
    const currentLayer = boxEl.querySelector('.digit-slide-layer.slide-active');

    // Create next layer starting from bottom
    const nextLayer = document.createElement('span');
    nextLayer.className = 'digit-slide-layer slide-in';
    nextLayer.textContent = newVal;
    boxEl.appendChild(nextLayer);

    // Force style flush
    void nextLayer.offsetWidth;

    // Trigger synchronized slide
    if (currentLayer) {
      currentLayer.classList.remove('slide-active');
      currentLayer.classList.add('slide-out');
    }
    nextLayer.classList.remove('slide-in');
    nextLayer.classList.add('slide-active');

    // Clean up old layer after animation
    setTimeout(() => {
      if (currentLayer && currentLayer.parentNode === boxEl) {
        boxEl.removeChild(currentLayer);
      }
    }, 450);
  }
}

window.ClockWidget = new ClockWidget();
