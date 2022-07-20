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
 * @param {void?} callback
 */

const refreshData = (callback) => {
  fetch(`${apiUrl}/data/`).then((result) => {
    result.json().then(({ data }) => {
      chrome.storage.local.set({ data });
      callback(data);
    });
  });
};

/**
 * @async
 * @description Reports active tab URL
 * @param {chrome.tabs.Tab} tab
 */

const report = async (tab) => {
  const version = chrome.runtime.getManifest().version;
  const body = JSON.stringify({ url: tab?.url, version });
  const headers = { 'Content-type': 'application/json' };
  const url = `${apiUrl}/report/`;

  await fetch(url, { body, headers, method: 'POST' });
  chrome.tabs.sendMessage(tab.id, { type: 'SHOW_REPORT_CONFIRMATION' });
};

/**
 * @description Listens to context menus
 */

chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case reportMenuItemId:
      if (tab) report(tab);
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
 * @description Listens to first start
 */

chrome.runtime.onStartup.addListener(() => {
  refreshData();
});

/**
 * @description Listens to messages
 */

chrome.runtime.onMessage.addListener((message, sender, callback) => {
  const hostname = message.hostname;
  const tabId = sender.tab?.id;

  switch (message.type) {
    case 'DISABLE_ICON':
      if (tabId) chrome.browserAction.setIcon({ path: 'assets/icons/disabled.png', tabId });
      break;
    case 'ENABLE_ICON':
      if (tabId) chrome.browserAction.setIcon({ path: 'assets/icons/enabled.png', tabId });
      break;
    case 'ENABLE_POPUP':
      if (tabId) chrome.browserAction.setPopup({ popup: 'popup.html', tabId });
      break;
    case 'GET_DATA':
      chrome.storage.local.get('data', ({ data }) => {
        if (data) callback(data);
        else refreshData(callback);
      });
      break;
    case 'GET_STATE':
      // prettier-ignore
      if (hostname) chrome.storage.local.get(hostname, (state) => callback(state[hostname] ?? initial));
      break;
    case 'GET_TAB':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => callback(tabs[0]));
      break;
    case 'UPDATE_STATE':
      if (hostname) chrome.storage.local.set({ [hostname]: message.state });
      break;
    default:
      break;
  }

  return true;
});
