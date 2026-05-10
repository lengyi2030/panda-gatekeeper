// Apply translations
document.querySelectorAll('[data-i18n]').forEach(el => {
  el.textContent = chrome.i18n.getMessage(el.dataset.i18n);
});

document.querySelectorAll('[data-i18n-title]').forEach(el => {
  const message = chrome.i18n.getMessage(el.dataset.i18nTitle);
  el.title = message;
  el.setAttribute('aria-label', message);
});

const shared = globalThis.PandaGatekeeperShared;

function mergeSettingsWithDefaults(settings) {
  return shared.normalizeSettings(settings);
}

function getClampedNumberValue(inputId, fallbackValue) {
  const input = document.getElementById(inputId);
  const parsedValue = Number.parseInt(input.value, 10);
  const minValue = Number.parseInt(input.min, 10);
  const maxValue = Number.parseInt(input.max, 10);

  if (Number.isNaN(parsedValue)) {
    return fallbackValue;
  }

  return Math.min(Math.max(parsedValue, minValue), maxValue);
}

function sendToActiveTab(message, callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, message, (res) => {
      void chrome.runtime.lastError;
      if (callback) callback(res);
    });
  });
}

// Show dismiss button only when the panda is active
const dismissBtn = document.getElementById('dismissBtn');
sendToActiveTab({ type: 'GET_PANDA_STATUS' }, (res) => {
  if (res?.pandaIsActive) dismissBtn.style.display = 'block';
});

dismissBtn.addEventListener('click', () => {
  sendToActiveTab({ type: 'DISMISS_PANDA' });
  dismissBtn.style.display = 'none';
});

// Test button - trigger panda immediately
const testBtn = document.getElementById('testBtn');
testBtn.addEventListener('click', () => {
  const breakTime = getClampedNumberValue('breakTime', 5);
  const usageLimit = getClampedNumberValue('usageLimit', 30);
  sendToActiveTab({ type: 'TEST_PANDA', breakTime, usageLimit });
  window.close();
});

const defaults = {
  ...shared.DEFAULT_SETTINGS,
};

// Load settings
chrome.storage.local.get(null, (settings) => {
  const mergedSettings = mergeSettingsWithDefaults(settings);

  document.getElementById('usageLimit').value = mergedSettings.usageLimit;
  document.getElementById('breakTime').value = mergedSettings.breakTime;
  document.getElementById('customDomains').value = mergedSettings.customDomains.join('\n');
  document.getElementById('pandaEnabled').checked = mergedSettings.pandaEnabled;
});

// Save settings
document.getElementById('saveBtn').addEventListener('click', () => {
  const settings = {
    pandaEnabled: document.getElementById('pandaEnabled').checked,
    usageLimit: getClampedNumberValue('usageLimit', defaults.usageLimit),
    breakTime: getClampedNumberValue('breakTime', defaults.breakTime),
    customDomains: shared.normalizeDomainList(document.getElementById('customDomains').value),
  };

  document.getElementById('usageLimit').value = settings.usageLimit;
  document.getElementById('breakTime').value = settings.breakTime;
  document.getElementById('customDomains').value = settings.customDomains.join('\n');

  chrome.storage.local.set(settings, () => {
    const msg = document.getElementById('savedMsg');
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 2000);

    sendToActiveTab({ type: 'UPDATE_SETTINGS', settings });
  });
});
