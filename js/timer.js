/**
 * Pomodoro & Custom Focus Timer with H:M:S Inputs and Styled Slider
 */
class FocusTimer {
  constructor() {
    this.totalSeconds = 25 * 60;
    this.remainingSeconds = 25 * 60;
    this.timerId = null;
    this.isRunning = false;
    this.currentMode = 'pomodoro'; // pomodoro, short, long, custom
    this.completedToday = 0;

    this.displayEl = document.getElementById('timer-display');
    this.pillEl = document.getElementById('timer-pill-display');
    this.startBtn = document.getElementById('timer-start-btn');
    this.resetBtn = document.getElementById('timer-reset-btn');
    this.modeBtns = document.querySelectorAll('.timer-mode-btn');
    this.progressRing = document.getElementById('timer-progress-ring');
    this.streakEl = document.getElementById('timer-streak-count');

    // H:M:S Inputs
    this.hoursInput = document.getElementById('timer-h-input');
    this.minsInput = document.getElementById('timer-m-input');
    this.secsInput = document.getElementById('timer-s-input');
    this.applyCustomBtn = document.getElementById('timer-apply-custom-btn');

    // Styled Range Slider
    this.durationSlider = document.getElementById('timer-duration-slider');
    this.sliderValEl = document.getElementById('timer-slider-val');
  }

  async init() {
    const todayKey = `pomodoroStreak_${new Date().toISOString().slice(0, 10)}`;
    const data = await window.StorageService.get(todayKey);
    this.completedToday = data[todayKey] || 0;
    this.updateStreakDisplay();

    this.syncFromSettings();

    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => this.toggle());
    }
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.reset());
    }

    this.modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        this.switchMode(mode);
        this.modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Quick minute adjusters (+1m, +5m, -1m, -5m)
    document.querySelectorAll('.timer-adjust-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const deltaMins = parseInt(btn.dataset.delta, 10);
        this.adjustTime(deltaMins);
      });
    });

    // Custom H:M:S Set Button
    if (this.applyCustomBtn) {
      this.applyCustomBtn.addEventListener('click', () => this.applyCustomHMS());
    }

    [this.hoursInput, this.minsInput, this.secsInput].forEach(inp => {
      inp?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.applyCustomHMS();
      });
    });

    // Styled Slider
    if (this.durationSlider) {
      this.durationSlider.addEventListener('input', (e) => {
        const mins = parseInt(e.target.value, 10);
        if (this.sliderValEl) this.sliderValEl.textContent = `${mins}m`;
        this.setCustomSeconds(mins * 60);
      });
    }

    this.updateDisplay();
  }

  syncFromSettings() {
    const s = window.SettingsManager?.settings || {};
    this.focusMins = s.timerFocusMins || 25;
    this.shortBreakMins = s.timerShortBreakMins || 5;
    this.longBreakMins = s.timerLongBreakMins || 15;

    const pBtn = document.querySelector('.timer-mode-btn[data-mode="pomodoro"]');
    if (pBtn) pBtn.textContent = `Focus (${this.focusMins}m)`;
    const sBtn = document.querySelector('.timer-mode-btn[data-mode="short"]');
    if (sBtn) sBtn.textContent = `Short (${this.shortBreakMins}m)`;
    const lBtn = document.querySelector('.timer-mode-btn[data-mode="long"]');
    if (lBtn) lBtn.textContent = `Long (${this.longBreakMins}m)`;

    if (!this.isRunning && this.currentMode !== 'custom') {
      this.switchMode(this.currentMode);
    }
  }

  applyCustomHMS() {
    const h = parseInt(this.hoursInput?.value || 0, 10) || 0;
    const m = parseInt(this.minsInput?.value || 0, 10) || 0;
    const s = parseInt(this.secsInput?.value || 0, 10) || 0;

    const total = (h * 3600) + (m * 60) + s;
    if (total <= 0) return;

    this.currentMode = 'custom';
    this.modeBtns.forEach(b => b.classList.remove('active'));
    this.setCustomSeconds(total);
  }

  setCustomSeconds(secs) {
    this.pause();
    this.totalSeconds = Math.max(1, secs);
    this.remainingSeconds = this.totalSeconds;
    this.syncHMSInputs(this.remainingSeconds);
    this.updateDisplay();
  }

  syncHMSInputs(totalSecs) {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    if (this.hoursInput) this.hoursInput.value = h.toString().padStart(2, '0');
    if (this.minsInput) this.minsInput.value = m.toString().padStart(2, '0');
    if (this.secsInput) this.secsInput.value = s.toString().padStart(2, '0');

    if (this.durationSlider && totalSecs <= 7200) {
      this.durationSlider.value = Math.round(totalSecs / 60);
      if (this.sliderValEl) this.sliderValEl.textContent = `${Math.round(totalSecs / 60)}m`;
    }
  }

  switchMode(mode) {
    this.pause();
    this.currentMode = mode;
    let mins = this.focusMins || 25;
    if (mode === 'short') mins = this.shortBreakMins || 5;
    if (mode === 'long') mins = this.longBreakMins || 15;

    this.totalSeconds = mins * 60;
    this.remainingSeconds = this.totalSeconds;
    this.syncHMSInputs(this.remainingSeconds);
    this.updateDisplay();
  }

  adjustTime(deltaMins) {
    const deltaSecs = deltaMins * 60;
    this.remainingSeconds = Math.max(60, this.remainingSeconds + deltaSecs);
    this.totalSeconds = Math.max(this.remainingSeconds, this.totalSeconds);
    this.syncHMSInputs(this.remainingSeconds);
    this.updateDisplay();
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.endTime = Date.now() + (this.remainingSeconds * 1000);

    if (this.startBtn) this.startBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </svg>
      <span>Pause</span>
    `;

    this.timerId = setInterval(() => {
      const msLeft = this.endTime - Date.now();
      const secsLeft = Math.max(0, Math.ceil(msLeft / 1000));
      this.remainingSeconds = secsLeft;
      this.updateDisplay();

      if (secsLeft <= 0) {
        this.onComplete();
      }
    }, 500);
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.endTime) {
      this.remainingSeconds = Math.max(0, Math.ceil((this.endTime - Date.now()) / 1000));
      this.endTime = null;
    }
    clearInterval(this.timerId);
    this.timerId = null;
    if (this.startBtn) this.startBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      <span>Start</span>
    `;
    document.title = 'New Tab';
  }

  reset() {
    this.switchMode(this.currentMode);
  }

  async onComplete() {
    this.pause();

    const chimeType = window.SettingsManager?.settings?.timerSound || 'haptic';
    try {
      window.SoundscapeEngine?.playChime(chimeType);
    } catch (e) {}

    if (this.currentMode === 'pomodoro') {
      this.completedToday++;
      this.updateStreakDisplay();
      const todayKey = `pomodoroStreak_${new Date().toISOString().slice(0, 10)}`;
      await window.StorageService.set({ [todayKey]: this.completedToday });
    }

    if (Notification.permission === 'granted') {
      new Notification('Focus Session Complete', {
        body: this.currentMode === 'pomodoro' 
          ? `Focus block done. You completed ${this.completedToday} session(s) today.` 
          : 'Break finished. Ready to focus?',
        icon: 'assets/icons/icon128.png'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    if (window.SettingsManager?.settings?.timerAutoStart) {
      if (this.currentMode === 'pomodoro') {
        const nextMode = (this.completedToday % 4 === 0) ? 'long' : 'short';
        this.switchMode(nextMode);
        document.querySelectorAll('.timer-mode-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.mode === nextMode);
        });
        setTimeout(() => this.start(), 1500);
      } else {
        this.switchMode('pomodoro');
        document.querySelectorAll('.timer-mode-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.mode === 'pomodoro');
        });
        setTimeout(() => this.start(), 1500);
      }
    }
  }

  updateStreakDisplay() {
    if (this.streakEl) {
      this.streakEl.textContent = `${this.completedToday} session${this.completedToday === 1 ? '' : 's'} completed today`;
    }
  }

  formatTime(totalSecs) {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  updateDisplay() {
    const formatted = this.formatTime(this.remainingSeconds);
    if (this.displayEl) this.displayEl.textContent = formatted;
    if (this.pillEl) this.pillEl.textContent = formatted;

    if (this.isRunning) {
      document.title = `(${formatted}) New Tab`;
    }

    if (this.progressRing) {
      const radius = 64;
      const circumference = 2 * Math.PI * radius;
      const progress = this.totalSeconds > 0 ? (this.remainingSeconds / this.totalSeconds) : 0;
      const dashoffset = circumference * (1 - progress);
      this.progressRing.style.strokeDashoffset = dashoffset;
    }
  }
}

window.FocusTimer = new FocusTimer();
