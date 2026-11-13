/**
 * Countdown 毕业 · Core JavaScript
 * Target: January 9, 2027 00:00:00 Local Time
 * Format: dd日,hh小时,mm分,ss秒
 */

(function () {
  'use strict';

  // Target: January 9, 2027 00:00:00 (Month 0 is January)
  const TARGET_DATE = new Date(2027, 0, 9, 0, 0, 0);

  // Reference start date for the academic progress calculation: September 1, 2026
  const SEMESTER_START = new Date(2026, 8, 1, 0, 0, 0);

  // DOM Elements
  const elDays = document.getElementById('val-days');
  const elHours = document.getElementById('val-hours');
  const elMinutes = document.getElementById('val-minutes');
  const elSeconds = document.getElementById('val-seconds');
  const elFormattedString = document.getElementById('formattedCountdownString');
  const elCopyBtn = document.getElementById('copyFormatBtn');
  const elCopiedToast = document.getElementById('copiedToast');

  const elProgressBar = document.getElementById('progressBar');
  const elProgressPercent = document.getElementById('progressPercent');
  const elJourneyStartLabel = document.getElementById('journeyStartLabel');
  const elTotalHours = document.getElementById('totalHoursRemaining');
  const elTotalMinutes = document.getElementById('totalMinutesRemaining');
  const elTotalSeconds = document.getElementById('totalSecondsRemaining');

  const elThemeToggle = document.getElementById('themeToggle');
  const elSoundToggle = document.getElementById('soundToggle');
  const elFullscreenToggle = document.getElementById('fullscreenToggle');
  const elStatusText = document.getElementById('statusText');
  const mouseGlow = document.getElementById('mouseGlow');

  // Sound Synth via Web Audio API (No external assets required)
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
      osc.frequency.setValueAtTime(820, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.045);
    } catch (e) {
      // Audio autoplay policy catch
    }
  }

  // Previous values cache for triggering tick animation only when value changes
  let prevValues = {
    days: null,
    hours: null,
    minutes: null,
    seconds: null
  };

  function updateDigit(element, newValue, unitKey) {
    const formatted = String(newValue).padStart(2, '0');
    if (prevValues[unitKey] !== formatted) {
      element.textContent = formatted;
      // Trigger slide/tick animation
      element.classList.remove('digit-tick');
      // Force reflow
      void element.offsetWidth;
      element.classList.add('digit-tick');

      if (unitKey === 'seconds') {
        playTickSound();
      }
      prevValues[unitKey] = formatted;
    }
  }

  function updateCountdown() {
    const now = new Date();
    const diff = TARGET_DATE - now;

    if (diff <= 0) {
      // Countdown completed
      updateDigit(elDays, 0, 'days');
      updateDigit(elHours, 0, 'hours');
      updateDigit(elMinutes, 0, 'minutes');
      updateDigit(elSeconds, 0, 'seconds');

      const completedFormat = '00日,00小时,00分,00秒';
      elFormattedString.textContent = completedFormat;
      elStatusText.textContent = '🎉 毕业快乐！Happy Graduation!';
      if (elProgressPercent) elProgressPercent.textContent = '100.0%';
      if (elProgressBar) elProgressBar.style.width = '100%';
      if (elTotalHours) elTotalHours.textContent = '0';
      if (elTotalMinutes) elTotalMinutes.textContent = '0';
      if (elTotalSeconds) elTotalSeconds.textContent = '0';
      return;
    }

    // Calculations
    const totalSeconds = Math.floor(diff / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);

    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    // Update UI Cards
    updateDigit(elDays, days, 'days');
    updateDigit(elHours, hours, 'hours');
    updateDigit(elMinutes, minutes, 'minutes');
    updateDigit(elSeconds, seconds, 'seconds');

    // Required Clock Format: dd日,hh小时,mm分,ss秒
    const pad = (n) => String(n).padStart(2, '0');
    const exactFormatString = `${pad(days)}日,${pad(hours)}小时,${pad(minutes)}分,${pad(seconds)}秒`;
    elFormattedString.textContent = exactFormatString;

    // Sub-metrics
    if (elTotalHours) elTotalHours.textContent = totalHours.toLocaleString();
    if (elTotalMinutes) elTotalMinutes.textContent = totalMinutes.toLocaleString();
    if (elTotalSeconds) elTotalSeconds.textContent = totalSeconds.toLocaleString();

    // Journey progress calculation
    const totalDuration = TARGET_DATE - SEMESTER_START;
    const elapsed = now - SEMESTER_START;
    let percent = (elapsed / totalDuration) * 100;
    percent = Math.max(0, Math.min(100, percent));

    if (elProgressPercent) elProgressPercent.textContent = `${percent.toFixed(1)}%`;
    if (elProgressBar) elProgressBar.style.width = `${percent.toFixed(1)}%`;
  }

  // Copy Format Feature
  let copyTimeout = null;
  elCopyBtn.addEventListener('click', async () => {
    const textToCopy = elFormattedString.textContent;
    try {
      await navigator.clipboard.writeText(textToCopy);
      elCopiedToast.textContent = `已复制: ${textToCopy}`;
      elCopiedToast.classList.add('show');

      clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        elCopiedToast.classList.remove('show');
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      elCopiedToast.textContent = `已复制: ${textToCopy}`;
      elCopiedToast.classList.add('show');
      clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        elCopiedToast.classList.remove('show');
      }, 2000);
    }
  });

  // Theme Toggle (Dark / Light with Local Storage)
  const sunIcon = elThemeToggle.querySelector('.sun-icon');
  const moonIcon = elThemeToggle.querySelector('.moon-icon');

  function applyTheme(isLight) {
    if (isLight) {
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
  if (savedTheme === 'light') {
    applyTheme(true);
  } else {
    applyTheme(false);
  }

  elThemeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.contains('light-theme');
    applyTheme(!isLight);
    localStorage.setItem('countdown-theme', !isLight ? 'light' : 'dark');
  });

  // Sound Toggle
  const soundOnIcon = elSoundToggle.querySelector('.sound-on');
  const soundOffIcon = elSoundToggle.querySelector('.sound-off');

  elSoundToggle.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    if (isSoundEnabled) {
      soundOnIcon.classList.remove('hidden');
      soundOffIcon.classList.add('hidden');
      playTickSound(); // preview immediate sound
    } else {
      soundOnIcon.classList.add('hidden');
      soundOffIcon.classList.remove('hidden');
    }
  });
  // Default sound off
  soundOnIcon.classList.add('hidden');
  soundOffIcon.classList.remove('hidden');

  // Fullscreen Toggle
  elFullscreenToggle.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  });

  // Smooth Interactive Ambient Mouse Glow
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function renderMouseGlow() {
    // Apple-style damping / lerp
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;
    if (mouseGlow) {
      mouseGlow.style.left = `${currentX}px`;
      mouseGlow.style.top = `${currentY}px`;
    }
    requestAnimationFrame(renderMouseGlow);
  }
  requestAnimationFrame(renderMouseGlow);

  // Initialize and run interval
  updateCountdown();
  setInterval(updateCountdown, 1000);
})();
