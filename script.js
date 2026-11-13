/**
 * Countdown 毕业 · Optimized Fast Runtime
 * Target: January 9, 2027 00:00:00 Local Time
 * Format: dd日,hh小时,mm分,ss秒
 */

(function () {
  'use strict';

  // Target: January 9, 2027 00:00:00 (Local Time)
  const TARGET_DATE = new Date(2027, 0, 9, 0, 0, 0);

  // Reference for progress calculation: September 1, 2026
  const SEMESTER_START = new Date(2026, 8, 1, 0, 0, 0);
  const TOTAL_DURATION = TARGET_DATE - SEMESTER_START;

  // Cache Elements
  const elDays = document.getElementById('val-days');
  const elHours = document.getElementById('val-hours');
  const elMinutes = document.getElementById('val-minutes');
  const elSeconds = document.getElementById('val-seconds');
  const elFormattedString = document.getElementById('formattedCountdownString');
  const elCopyBtn = document.getElementById('copyFormatBtn');
  const elCopiedToast = document.getElementById('copiedToast');

  const elProgressBar = document.getElementById('progressBar');
  const elProgressPercent = document.getElementById('progressPercent');
  const elTotalHours = document.getElementById('totalHoursRemaining');
  const elTotalMinutes = document.getElementById('totalMinutesRemaining');
  const elTotalSeconds = document.getElementById('totalSecondsRemaining');

  const elThemeToggle = document.getElementById('themeToggle');
  const elSoundToggle = document.getElementById('soundToggle');
  const elFullscreenToggle = document.getElementById('fullscreenToggle');
  const elStatusText = document.getElementById('statusText');
  const mouseGlow = document.getElementById('mouseGlow');

  // Lightweight Audio Context (lazy loaded on demand)
  let audioCtx = null;
  let isSoundEnabled = false;

  function playTickSound() {
    if (!isSoundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.035);
    } catch (_) {}
  }

  // Previous state cache
  let prevD = '', prevH = '', prevM = '', prevS = '';

  function setDigit(el, val, isSec) {
    if (el.textContent !== val) {
      el.textContent = val;
      // Snappy animation without synchronous layout thrashing
      el.classList.remove('digit-tick');
      requestAnimationFrame(() => {
        el.classList.add('digit-tick');
      });
      if (isSec) playTickSound();
    }
  }

  function updateCountdown() {
    const now = Date.now();
    const diff = TARGET_DATE.getTime() - now;

    if (diff <= 0) {
      setDigit(elDays, '00', false);
      setDigit(elHours, '00', false);
      setDigit(elMinutes, '00', false);
      setDigit(elSeconds, '00', false);
      elFormattedString.textContent = '00日,00小时,00分,00秒';
      elStatusText.textContent = '🎉 毕业快乐！Happy Graduation!';
      if (elProgressPercent) elProgressPercent.textContent = '100.0%';
      if (elProgressBar) elProgressBar.style.width = '100%';
      if (elTotalHours) elTotalHours.textContent = '0';
      if (elTotalMinutes) elTotalMinutes.textContent = '0';
      if (elTotalSeconds) elTotalSeconds.textContent = '0';
      return;
    }

    const totalSeconds = (diff / 1000) | 0;
    const totalMinutes = (totalSeconds / 60) | 0;
    const totalHours = (totalMinutes / 60) | 0;

    const d = (totalHours / 24) | 0;
    const h = totalHours % 24;
    const m = totalMinutes % 60;
    const s = totalSeconds % 60;

    const strD = d < 10 ? '0' + d : String(d);
    const strH = h < 10 ? '0' + h : String(h);
    const strM = m < 10 ? '0' + m : String(m);
    const strS = s < 10 ? '0' + s : String(s);

    if (strD !== prevD) { setDigit(elDays, strD, false); prevD = strD; }
    if (strH !== prevH) { setDigit(elHours, strH, false); prevH = strH; }
    if (strM !== prevM) { setDigit(elMinutes, strM, false); prevM = strM; }
    if (strS !== prevS) { setDigit(elSeconds, strS, true); prevS = strS; }

    // Required Clock Format: dd日,hh小时,mm分,ss秒
    elFormattedString.textContent = `${strD}日,${strH}小时,${strM}分,${strS}秒`;

    if (elTotalHours) elTotalHours.textContent = totalHours.toLocaleString();
    if (elTotalMinutes) elTotalMinutes.textContent = totalMinutes.toLocaleString();
    if (elTotalSeconds) elTotalSeconds.textContent = totalSeconds.toLocaleString();

    // Journey progress
    const elapsed = now - SEMESTER_START.getTime();
    let percent = (elapsed / TOTAL_DURATION) * 100;
    percent = percent < 0 ? 0 : percent > 100 ? 100 : percent;

    if (elProgressPercent) elProgressPercent.textContent = `${percent.toFixed(1)}%`;
    if (elProgressBar) elProgressBar.style.width = `${percent.toFixed(1)}%`;
  }

  // Copy Format Feature
  let copyTimer = null;
  elCopyBtn.addEventListener('click', async () => {
    const text = elFormattedString.textContent;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      elCopiedToast.textContent = `已复制: ${text}`;
      elCopiedToast.classList.add('show');
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => elCopiedToast.classList.remove('show'), 1800);
    } catch (_) {}
  });

  // Theme Toggle
  const sunIcon = elThemeToggle.querySelector('.sun-icon');
  const moonIcon = elThemeToggle.querySelector('.moon-icon');

  function setTheme(light) {
    if (light) {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
  }

  const savedTheme = localStorage.getItem('countdown-theme');
  if (savedTheme === 'light') setTheme(true);

  elThemeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.contains('light-theme');
    setTheme(!isLight);
    localStorage.setItem('countdown-theme', !isLight ? 'light' : 'dark');
  });

  // Sound Toggle
  const soundOn = elSoundToggle.querySelector('.sound-on');
  const soundOff = elSoundToggle.querySelector('.sound-off');

  elSoundToggle.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundOn.classList.toggle('hidden', !isSoundEnabled);
    soundOff.classList.toggle('hidden', isSoundEnabled);
    if (isSoundEnabled) playTickSound();
  });

  // Fullscreen Toggle
  elFullscreenToggle.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Passive Hardware Mouse Glow (Only updates on pointer movement, 0 idle overhead)
  let glowTicking = false;
  window.addEventListener('pointermove', (e) => {
    if (!glowTicking && mouseGlow) {
      glowTicking = true;
      requestAnimationFrame(() => {
        mouseGlow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate3d(-50%, -50%, 0)`;
        glowTicking = false;
      });
    }
  }, { passive: true });

  // Instant render on load
  updateCountdown();
  setInterval(updateCountdown, 1000);
})();
