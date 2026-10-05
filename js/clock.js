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
   * Safely updates a digit container without accumulating multiple digits side-by-side.
   */
  updateDigit(boxEl, newVal, allowSlide) {
    if (!boxEl) return;

    // If first tick, background tab, or slide not allowed, directly set text
    if (!allowSlide || boxEl.textContent.trim() === newVal) {
      boxEl.textContent = newVal;
      return;
    }

    const oldVal = boxEl.textContent.trim() || newVal;

    // Clear any previous child nodes to guarantee zero accumulation
    boxEl.innerHTML = '';

    // Create a strict vertical roller container
    const rollContainer = document.createElement('div');
    rollContainer.className = 'digit-roll-wrapper';

    const oldSpan = document.createElement('div');
    oldSpan.className = 'digit-roll-item digit-roll-old';
    oldSpan.textContent = oldVal;

    const newSpan = document.createElement('div');
    newSpan.className = 'digit-roll-item digit-roll-new';
    newSpan.textContent = newVal;

    rollContainer.appendChild(oldSpan);
    rollContainer.appendChild(newSpan);
    boxEl.appendChild(rollContainer);

    // Trigger vertical slide animation
    requestAnimationFrame(() => {
      rollContainer.classList.add('rolling');
    });

    // Clean up immediately after animation finishes into pure text
    setTimeout(() => {
      if (boxEl.contains(rollContainer)) {
        boxEl.textContent = newVal;
      }
    }, 380);
  }
}

window.ClockWidget = new ClockWidget();
