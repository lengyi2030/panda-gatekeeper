const shared = globalThis.PandaGatekeeperShared;

const VIDEO_ASSETS = ['neko2.webm'];

const preloadVideos = VIDEO_ASSETS.map(() => {
  const v = document.createElement('video');
  v.preload = 'auto';
  v.muted = true;
  return v;
});

const preventScroll = (e) => e.preventDefault();

const hostname = location.hostname;
const USAGE_STORAGE_KEY = 'pandaGatekeeperUsage';
const USAGE_STALE_AFTER_MS = 30 * 60 * 1000;
const USAGE_SAVE_INTERVAL_SECONDS = 5;

function mergeSettingsWithDefaults(settings) {
  return shared.normalizeSettings(settings);
}

function getMatchedDomain(settings) {
  return shared.normalizeDomainList(settings.customDomains).find((domain) =>
    shared.hostnameMatchesDomain(hostname, domain)
  ) || '';
}

function isSiteEnabled(settings) {
  return !!getMatchedDomain(settings);
}

function applySettings(settings, { resetUsage = false } = {}) {
  const mergedSettings = mergeSettingsWithDefaults(settings);
  currentUsageLimit = mergedSettings.usageLimit;
  currentBreakTime = mergedSettings.breakTime;
  currentCustomDomains = mergedSettings.customDomains;
  currentUsageKey = getMatchedDomain(mergedSettings);
  currentPandaEnabled = mergedSettings.pandaEnabled && !!currentUsageKey;

  if (!currentPandaEnabled) {
    stopTracker();
    return;
  }

  if (!pandaIsActive) {
    startTracking(currentUsageLimit, currentBreakTime, { resetUsage });
  }
}

let pandaIsActive = false;
let trackerRunning = false;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_PANDA_STATUS') {
    sendResponse({
      pandaIsActive,
      hostname,
      trackerRunning,
      customDomains: currentCustomDomains,
      isTracked: currentPandaEnabled,
      trackedDomain: currentUsageKey,
      hasFocus: document.hasFocus(),
      isHidden: document.hidden,
    });
    return;
  }

  if (message.type === 'UPDATE_SETTINGS') {
    stopTracker();
    applySettings(message.settings, { resetUsage: true });
  }

  if (message.type === 'TEST_PANDA') {
    if (!pandaIsActive) {
      pandaIsActive = true;
      showPanda(message.breakTime || currentBreakTime, message.usageLimit || currentUsageLimit, () => {
        if (currentPandaEnabled) {
          startTracking(currentUsageLimit, currentBreakTime);
        }
      });
    }
  }

  if (message.type === 'DISMISS_PANDA') {
    const overlay = document.getElementById('panda-gatekeeper-overlay');
    if (!overlay) return;
    const dismissedUsageKey = currentUsageKey;
    pandaIsActive = false;
    stopCountdown();
    stopSpeech();
    resetUsageSeconds(dismissedUsageKey);
    overlay.style.transition = 'opacity 0.5s';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      document.documentElement.style.overflow = '';
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
      if (currentPandaEnabled && dismissedUsageKey === currentUsageKey) {
        startTracking(currentUsageLimit, currentBreakTime);
      }
    }, 500);
  }
});

let resetSeconds = () => {};
let stopTracker = () => {};
let stopCountdown = () => {};
let stopSpeech = () => {};
let currentUsageLimit = 60;
let currentBreakTime = 5;
let currentPandaEnabled = false;
let currentCustomDomains = [];
let currentUsageKey = '';
let pandaAssetsPrepared = false;
let trackerRunId = 0;

function getUsageStorageKey(usageKey) {
  return `${USAGE_STORAGE_KEY}:${usageKey}`;
}

function loadUsageSeconds(usageKey, callback) {
  const storageKey = getUsageStorageKey(usageKey);

  chrome.storage.local.get({ [storageKey]: null }, (result) => {
    const entry = result[storageKey];
    const now = Date.now();

    if (!entry || typeof entry !== 'object') {
      callback(0);
      return;
    }

    if (now - Number(entry.updatedAt || 0) > USAGE_STALE_AFTER_MS) {
      callback(0);
      return;
    }

    callback(Math.max(0, Number.parseInt(entry.seconds, 10) || 0));
  });
}

function saveUsageSeconds(usageKey, seconds) {
  if (!usageKey) return;

  chrome.storage.local.set({
    [getUsageStorageKey(usageKey)]: {
      seconds: Math.max(0, seconds),
      updatedAt: Date.now(),
    },
  });
}

function resetUsageSeconds(usageKey) {
  saveUsageSeconds(usageKey, 0);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) resetSeconds({ clearStoredUsage: true });
});

window.addEventListener('pagehide', () => {
  resetSeconds();
});

function startTracking(usageLimit, breakTime, { resetUsage = false } = {}) {
  preparePandaAssets();
  stopTracker();
  const runId = ++trackerRunId;
  currentUsageLimit = usageLimit;
  currentBreakTime = breakTime;
  const usageKey = currentUsageKey;

  if (resetUsage) {
    resetUsageSeconds(usageKey);
  }

  loadUsageSeconds(usageKey, (initialSeconds) => {
    if (
      runId !== trackerRunId ||
      usageKey !== currentUsageKey ||
      pandaIsActive ||
      !currentPandaEnabled
    ) {
      return;
    }

    trackerRunning = true;
    let localSeconds = resetUsage ? 0 : initialSeconds;
    let secondsSinceSave = 0;
    let shouldPersistUsage = true;

    resetSeconds = ({ clearStoredUsage = false } = {}) => {
      if (clearStoredUsage) {
        shouldPersistUsage = false;
        localSeconds = 0;
        resetUsageSeconds(usageKey);
        return;
      }

      saveUsageSeconds(usageKey, localSeconds);
    };

    const tracker = setInterval(() => {
      if (usageKey !== currentUsageKey || pandaIsActive || !currentPandaEnabled) {
        clearInterval(tracker);
        trackerRunning = false;
        return;
      }

      if (document.hidden || !document.hasFocus()) return;

      localSeconds++;
      secondsSinceSave++;

      if (secondsSinceSave >= USAGE_SAVE_INTERVAL_SECONDS) {
        saveUsageSeconds(usageKey, localSeconds);
        secondsSinceSave = 0;
      }

      if (localSeconds >= usageLimit * 60) {
        clearInterval(tracker);
        trackerRunning = false;
        pandaIsActive = true;
        shouldPersistUsage = false;
        localSeconds = 0;
        resetUsageSeconds(usageKey);
        showPanda(breakTime, usageLimit, () => {
          if (currentPandaEnabled && usageKey === currentUsageKey) {
            startTracking(currentUsageLimit, currentBreakTime);
          }
        });
      }
    }, 1000);

    stopTracker = () => {
      trackerRunning = false;
      if (shouldPersistUsage) {
        saveUsageSeconds(usageKey, localSeconds);
      }
      clearInterval(tracker);
      trackerRunId++;
    };
  });
}

function preparePandaAssets() {
  if (pandaAssetsPrepared) return;

  VIDEO_ASSETS.forEach((asset, i) => {
    preloadVideos[i].src = chrome.runtime.getURL(`assets/${asset}`);
    preloadVideos[i].load();
  });
  pandaAssetsPrepared = true;
}

chrome.storage.local.get(null, (settings) => {
  applySettings(settings);
});

function speakPandaMessage() {
  const text = '主人，你该休息了';

  let cancelled = false;
  stopSpeech = () => {
    cancelled = true;
    window.speechSynthesis.cancel();
    if (audioEl) {
      audioEl.pause();
      audioEl.remove();
      audioEl = null;
    }
  };

  // Try pre-generated audio first
  const audioUrl = chrome.runtime.getURL('assets/panda_speech_元气少女.opus');
  let audioEl = new Audio(audioUrl);
  audioEl.volume = 0.8;

  audioEl.onended = () => {
    if (!cancelled) {
      audioEl = null;
    }
  };

  audioEl.onerror = () => {
    // Fall back to Web Speech API
    if (cancelled) return;
    audioEl = null;
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85;
    utterance.pitch = 0.9;
    utterance.volume = 0.8;

    const setVoice = () => {
      if (cancelled) return;
      const voices = window.speechSynthesis.getVoices();
      const chineseVoice = voices.find(v => v.lang.startsWith('zh-CN')) ||
                           voices.find(v => v.lang.startsWith('zh')) ||
                           voices[0];
      if (chineseVoice) utterance.voice = chineseVoice;
      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      setVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }
  };

  audioEl.play().catch(() => {});
}

function showPanda(breakMinutes, usageLimit, onBreakEnd) {
  document.getElementById('panda-gatekeeper-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'panda-gatekeeper-overlay';
  overlay.style.setProperty('opacity', '1', 'important');
  overlay.style.transition = '';

  // Countdown timer
  const countdown = document.createElement('div');
  countdown.id = 'panda-gatekeeper-countdown';
  let seconds = breakMinutes * 60;

  let countdownCancelled = false;
  stopCountdown = () => { countdownCancelled = true; };

  function updateCountdown() {
    if (countdownCancelled) return;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    countdown.textContent = `${m}:${String(s).padStart(2, '0')}`;
    if (seconds > 0) {
      seconds--;
      setTimeout(updateCountdown, 1000);
    } else {
      pandaIsActive = false;
      stopSpeech();
      overlay.style.transition = 'opacity 1s';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        document.documentElement.style.overflow = '';
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
        onBreakEnd();
      }, 1000);
    }
  }
  updateCountdown();

  // Create 3 video elements cycling
  const videos = VIDEO_ASSETS.map((asset, i) => {
    const v = document.createElement('video');
    v.src = chrome.runtime.getURL(`assets/${asset}`);
    v.muted = true;
    v.playsInline = true;
    if (i === 0) {
      v.classList.add('entrance');
    } else {
      v.style.display = 'none';
    }
    return v;
  });

  let currentVideoIdx = 0;

  function cycleToNext() {
    const current = videos[currentVideoIdx];
    current.style.display = 'none';
    current.classList.remove('entrance', 'looping');

    currentVideoIdx = (currentVideoIdx + 1) % videos.length;
    const next = videos[currentVideoIdx];

    if (currentVideoIdx === 0) {
      next.classList.add('entrance');
    } else {
      next.classList.add('looping');
    }
    next.style.display = 'block';
    next.currentTime = 0;
    next.play().catch(() => {});
  }

  videos.forEach((v) => {
    v.addEventListener('ended', () => {
      if (countdownCancelled) return;
      cycleToNext();
    });
  });

  overlay.appendChild(countdown);
  videos.forEach(v => overlay.appendChild(v));
  document.body.appendChild(overlay);
  document.documentElement.style.overflow = 'hidden';
  document.addEventListener('wheel', preventScroll, { passive: false });
  document.addEventListener('touchmove', preventScroll, { passive: false });

  // Pause other page videos
  document.querySelectorAll('video').forEach(v => {
    if (!videos.includes(v)) v.pause();
  });

  // Start first video
  videos[0].play().catch(() => {});

  // Speak the message
  speakPandaMessage();
}
