/**
 * Countdown 毕业 · Runtime Engine
 * Target: January 9, 2027 00:00:00 Local Time
 * Format: dd日,hh小时,mm分,ss秒
 * Background Music: Exact song from https://youtu.be/aivb0mwmA7o (Looped)
 */

(function () {
  'use strict';

  // Target: January 9, 2027 00:00:00 (Local Time)
  const TARGET_DATE = new Date(2027, 0, 9, 0, 0, 0);
  const TARGET_TIME = TARGET_DATE.getTime();

  // Academic start date reference (Sep 1, 2026) for progress bar
  const SEMESTER_START = new Date(2026, 8, 1, 0, 0, 0).getTime();
  const TOTAL_DURATION = TARGET_TIME - SEMESTER_START;

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
  const elTotalHours = document.getElementById('totalHoursRemaining');
  const elTotalMinutes = document.getElementById('totalMinutesRemaining');
  const elTotalSeconds = document.getElementById('totalSecondsRemaining');

  const elThemeToggle = document.getElementById('themeToggle');
  const elFullscreenToggle = document.getElementById('fullscreenToggle');
  const mouseGlow = document.getElementById('mouseGlow');

  // Music Elements
  const bgmAudio = document.getElementById('bgmAudio');
  const elMusicPill = document.getElementById('musicPill');
  const elMusicText = document.getElementById('musicText');

  /* ==========================================================================
     1. Unstoppable Background Music Engine (Autoplay + Infinite Loop)
     ========================================================================== */
  function forcePlayMusic() {
    if (!bgmAudio) return;
    bgmAudio.loop = true;
    bgmAudio.volume = 1.0;
    const playPromise = bgmAudio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        if (elMusicPill) elMusicPill.classList.add('playing');
        if (elMusicText) elMusicText.textContent = '🎵 BGM: 毕业歌';
      }).catch(() => {
        // Awaiting browser gesture unlock if blocked on zero-interaction entry
        if (elMusicText) elMusicText.textContent = '🎵 BGM (TAP TO PLAY)';
      });
    }
  }

  if (bgmAudio) {
    bgmAudio.loop = true;
    bgmAudio.autoplay = true;

    // Guaranteed infinite loop on end
    bgmAudio.addEventListener('ended', () => {
      bgmAudio.currentTime = 0;
      forcePlayMusic();
    });

    // Make music CANNOT be turned off: immediately resume if paused
    bgmAudio.addEventListener('pause', () => {
      forcePlayMusic();
    });

    // Attempt instant autoplay immediately on script load, DOM ready, and window load
    forcePlayMusic();
    document.addEventListener('DOMContentLoaded', forcePlayMusic);
    window.addEventListener('load', forcePlayMusic);
  }

  // Catch every possible user gesture so audio starts the exact millisecond user interacts
  const gestureEvents = ['pointerdown', 'touchstart', 'touchend', 'mousedown', 'click', 'keydown', 'wheel', 'scroll'];
  gestureEvents.forEach(eventType => {
    window.addEventListener(eventType, () => {
      if (bgmAudio && bgmAudio.paused) {
        forcePlayMusic();
      }
    }, { passive: true });
  });

  // Clicking the music pill also forces playback
  if (elMusicPill) {
    elMusicPill.addEventListener('click', () => {
      forcePlayMusic();
    });
  }

  /* ==========================================================================
     2. Mechanical Subtle Keypress Sound Synth (Web Audio API)
     ========================================================================== */
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

  /* ==========================================================================
     3. High-Reliability Live Countdown Engine
     ========================================================================== */
  let prevD = '', prevH = '', prevM = '', prevS = '';

  function setDigit(el, val, isSec) {
    if (!el) return;
    if (el.textContent !== val) {
      el.textContent = val;
      el.classList.remove('digit-tick');
      requestAnimationFrame(() => {
        el.classList.add('digit-tick');
      });
      if (isSec) playTickSound();
    }
  }

  function updateCountdown() {
    try {
      const now = Date.now();
      const diff = TARGET_TIME - now;

      if (diff <= 0) {
        setDigit(elDays, '00', false);
        setDigit(elHours, '00', false);
        setDigit(elMinutes, '00', false);
        setDigit(elSeconds, '00', false);
        if (elFormattedString) elFormattedString.textContent = '00日,00小时,00分,00秒';
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

      // Clock Format: dd日,hh小时,mm分,ss秒
      if (elFormattedString) {
        elFormattedString.textContent = `${strD}日,${strH}小时,${strM}分,${strS}秒`;
      }

      // Sub-metrics
      if (elTotalHours) elTotalHours.textContent = totalHours.toLocaleString();
      if (elTotalMinutes) elTotalMinutes.textContent = totalMinutes.toLocaleString();
      if (elTotalSeconds) elTotalSeconds.textContent = totalSeconds.toLocaleString();

      // Journey progress calculation
      const elapsed = now - SEMESTER_START;
      let percent = (elapsed / TOTAL_DURATION) * 100;
      percent = percent < 0 ? 0 : percent > 100 ? 100 : percent;

      if (elProgressPercent) elProgressPercent.textContent = `${percent.toFixed(1)}%`;
      if (elProgressBar) elProgressBar.style.width = `${percent.toFixed(1)}%`;
    } catch (err) {
      console.error('Countdown update error:', err);
    }
  }

  // 250ms interval for precision
  setInterval(updateCountdown, 250);

  // Auto-resync when returning to tab or waking screen
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateCountdown();
  });
  window.addEventListener('focus', updateCountdown);
  window.addEventListener('pageshow', updateCountdown);

  // Initial calculation
  updateCountdown();

  /* ==========================================================================
     4. Interactive Utilities (Copy, Theme, Fullscreen, Pointer Glow)
     ========================================================================== */
  // Copy format string
  let copyTimer = null;
  if (elCopyBtn) {
    elCopyBtn.addEventListener('click', async () => {
      const text = elFormattedString ? elFormattedString.textContent : '';
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
        if (elCopiedToast) {
          elCopiedToast.textContent = `COPIED: ${text}`;
          elCopiedToast.classList.add('show');
          clearTimeout(copyTimer);
          copyTimer = setTimeout(() => elCopiedToast.classList.remove('show'), 1800);
        }
      } catch (_) {}
    });
  }

  // Theme Toggle
  const sunIcon = elThemeToggle ? elThemeToggle.querySelector('.sun-icon') : null;
  const moonIcon = elThemeToggle ? elThemeToggle.querySelector('.moon-icon') : null;

  function setTheme(light) {
    if (light) {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      if (sunIcon) sunIcon.classList.remove('hidden');
      if (moonIcon) moonIcon.classList.add('hidden');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      if (sunIcon) sunIcon.classList.add('hidden');
      if (moonIcon) moonIcon.classList.remove('hidden');
    }
  }

  const savedTheme = localStorage.getItem('countdown-theme');
  if (savedTheme === 'light') setTheme(true);

  if (elThemeToggle) {
    elThemeToggle.addEventListener('click', () => {
      const isLight = document.body.classList.contains('light-theme');
      setTheme(!isLight);
      localStorage.setItem('countdown-theme', !isLight ? 'light' : 'dark');
    });
  }

  // Fullscreen Toggle
  if (elFullscreenToggle) {
    elFullscreenToggle.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  // Passive Pointer Glow
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
})();
