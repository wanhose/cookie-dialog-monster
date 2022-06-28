/**
 * @description API URL
 * @type {string}
 */

const apiUrl = 'https://api.cookie-dialog-monster.com/rest/v2';

/**
 * @description Initial state
 * @type {{ enabled: boolean }}
 */

const initial = { enabled: true };

/**
 * @description Context menu identifier
 * @type {string}
 */

const reportMenuItemId = 'REPORT';

/**
 * @description Refreshes data
 */

const refreshData = async () => {
  const result = await fetch(`${apiUrl}/data/`);
  const { data } = await result.json();
  await chrome.storage.local.set({ data });
};

/**
 * @description Reports active tab URL
 */

const report = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const userAgent = window.navigator.userAgent;
    const version = chrome.runtime.getManifest().version;

    fetch(`${apiUrl}/report/`, {
      body: JSON.stringify({ tabUrl: tab.url, userAgent, version }),
      headers: { 'Content-type': 'application/json' },
      method: 'POST',
    });
  });
};

/**
 * @description Listens to context menus
 */

chrome.contextMenus.onClicked.addListener((info) => {
  switch (info.menuItemId) {
    case reportMenuItemId:
      report();
      break;
    default:
      break;
  }
});

/**
 * @description Listens to extension installed/updated
 */

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    contexts: ['all'],
    documentUrlPatterns: chrome.runtime.getManifest().content_scripts[0].matches,
    id: reportMenuItemId,
    title: chrome.i18n.getMessage('contextMenuText'),
  });
});

/**
 * @description Listens to messages
 */

chrome.runtime.onMessage.addListener((message, sender, callback) => {
  const hostname = message.hostname;
  const tabId = sender.tab?.id;

  switch (message.type) {
    case 'DISABLE_ICON':
      if (tabId) chrome.action.setIcon({ path: '/assets/icons/disabled.png', tabId });
      break;
    case 'ENABLE_ICON':
      if (tabId) chrome.action.setIcon({ path: '/assets/icons/enabled.png', tabId });
      break;
    case 'ENABLE_POPUP':
      if (tabId) chrome.action.setPopup({ popup: 'popup.html', tabId });
      break;
    case 'GET_DATA':
      chrome.storage.local.get('data', ({ data }) => callback(data));
      break;
    case 'GET_STATE':
      chrome.storage.local.get(hostname, (state) => callback(state[hostname] ?? initial));
      break;
    case 'GET_TAB':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => callback(tabs[0]));
      break;
    case 'REFRESH_DATA':
      refreshData();
      break;
    case 'UPDATE_STATE':
      chrome.storage.local.set({ [hostname]: message.state });
      break;
    default:
      break;
  }

  return true;
});

/**
 * @description Listens to first start
 */

chrome.runtime.onStartup.addListener(() => {
  refreshData();
});
