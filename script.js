/**
 * Countdown 毕业 · Optimized Fast Runtime with Looping Background Music
 * Target: January 9, 2027 00:00:00 Local Time
 * Format: dd日,hh小时,mm分,ss秒
 * BGM: https://youtu.be/aivb0mwmA7o (Infinite Loop)
 */

(function () {
  'use strict';

  // Target: January 9, 2027 00:00:00 (Local Time)
  const TARGET_DATE = new Date(2027, 0, 9, 0, 0, 0);
  const TARGET_TIME = TARGET_DATE.getTime();

  // Academic semester reference for graduation progress (Sep 1, 2026)
  const SEMESTER_START = new Date(2026, 8, 1, 0, 0, 0).getTime();
  const TOTAL_DURATION = TARGET_TIME - SEMESTER_START;

  // Cache Countdown Elements
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
  const mouseGlow = document.getElementById('mouseGlow');

  // Music Elements
  const elMusicToggle = document.getElementById('musicToggle');
  const elMusicText = document.getElementById('musicText');

  /* ==========================================================================
     1. YouTube Background Music Player (Infinite Loop: aivb0mwmA7o)
     ========================================================================== */
  const YOUTUBE_VIDEO_ID = 'aivb0mwmA7o';
  let ytPlayer = null;
  let isMusicPlaying = false;
  let hasUserInteracted = false;

  function updateMusicUI(playing) {
    isMusicPlaying = playing;
    if (elMusicToggle) {
      elMusicToggle.classList.toggle('playing', playing);
      if (elMusicText) {
        elMusicText.textContent = playing ? '播放中 · 毕业歌' : '播放音乐';
      }
    }
  }

  // Initialize YouTube IFrame API
  window.onYouTubeIframeAPIReady = function () {
    try {
      ytPlayer = new YT.Player('ytPlayer', {
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: YOUTUBE_VIDEO_ID, // Required by YouTube to loop single video
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: function (event) {
            try {
              event.target.setVolume(100);
              // Attempt unmuted or muted autoplay based on browser policy
              const playPromise = event.target.playVideo();
              if (playPromise && playPromise.catch) {
                playPromise.catch(() => {});
              }
            } catch (_) {}
          },
          onStateChange: function (event) {
            // YT.PlayerState: -1 (UNSTARTED), 0 (ENDED), 1 (PLAYING), 2 (PAUSED), 3 (BUFFERING)
            if (event.data === 0) {
              // Video ended -> Loop again seamlessly
              try {
                event.target.seekTo(0);
                event.target.playVideo();
              } catch (_) {}
            } else if (event.data === 1) {
              updateMusicUI(true);
            } else if (event.data === 2) {
              updateMusicUI(false);
            }
          }
        }
      });
    } catch (e) {
      console.warn('YouTube Player initialization:', e);
    }
  };

  // Browser Autoplay Policy: If browser blocked initial autoplay, start on first user interaction
  function unlockAudioOnInteraction() {
    if (hasUserInteracted) return;
    hasUserInteracted = true;
    if (ytPlayer && typeof ytPlayer.playVideo === 'function' && !isMusicPlaying) {
      try {
        ytPlayer.playVideo();
      } catch (_) {}
    }
  }

  window.addEventListener('pointerdown', unlockAudioOnInteraction, { once: true });
  window.addEventListener('keydown', unlockAudioOnInteraction, { once: true });

  // Music Button Click Toggle
  if (elMusicToggle) {
    elMusicToggle.addEventListener('click', () => {
      hasUserInteracted = true;
      if (!ytPlayer || typeof ytPlayer.getPlayerState !== 'function') return;

      try {
        const state = ytPlayer.getPlayerState();
        if (state === 1) { // Currently Playing
          ytPlayer.pauseVideo();
          updateMusicUI(false);
        } else {
          ytPlayer.playVideo();
          updateMusicUI(true);
        }
      } catch (_) {}
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
     (Driven strictly by wall-clock time; immune to tab background throttling)
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

      // Exact wall clock division
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

  // High-frequency 250ms check: catches second transitions immediately with 0 drift
  setInterval(updateCountdown, 250);

  // Re-sync immediately on visibility/tab change, window focus, or device wake
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateCountdown();
  });
  window.addEventListener('focus', updateCountdown);
  window.addEventListener('pageshow', updateCountdown);

  // Render initial tick immediately
  updateCountdown();

  /* ==========================================================================
     4. Interactive Utilities (Copy, Theme, Fullscreen, Mouse Glow)
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
          elCopiedToast.textContent = `已复制: ${text}`;
          elCopiedToast.classList.add('show');
          clearTimeout(copyTimer);
          copyTimer = setTimeout(() => elCopiedToast.classList.remove('show'), 1800);
        }
      } catch (_) {}
    });
  }

  // Theme Toggle (Dark / Light)
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

  // Sound Toggle
  if (elSoundToggle) {
    const soundOn = elSoundToggle.querySelector('.sound-on');
    const soundOff = elSoundToggle.querySelector('.sound-off');
    elSoundToggle.addEventListener('click', () => {
      isSoundEnabled = !isSoundEnabled;
      if (soundOn) soundOn.classList.toggle('hidden', !isSoundEnabled);
      if (soundOff) soundOff.classList.toggle('hidden', isSoundEnabled);
      if (isSoundEnabled) playTickSound();
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

  // Passive Pointer Glow (0 idle CPU overhead)
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
