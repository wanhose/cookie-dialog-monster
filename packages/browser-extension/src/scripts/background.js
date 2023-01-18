/**
 * @description API URL
 * @type {string}
 */

const apiUrl = 'https://api.cookie-dialog-monster.com/rest/v3';

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
 * @description A shortcut for chrome.scripting
 * @type {chrome.scripting}
 */

const script = chrome.scripting;

/**
 * @description The storage to use
 * @type {chrome.storage.LocalStorageArea}
 */

const storage = chrome.storage.local;

/**
 * @description Refreshes data
 * @param {void?} callback
 */

const refreshData = (callback) => {
  fetch(`${apiUrl}/data/`).then((result) => {
    result.json().then(({ data }) => {
      chrome.storage.local.set({ data });
      callback?.(data);
    });
  });
};

/**
 * @async
 * @description Reports active tab URL
 * @param {any} message
 * @param {chrome.tabs.Tab} tab
 */

const report = async (message, tab) => {
  const reason = message.reason;
  const userAgent = message.userAgent;
  const version = chrome.runtime.getManifest().version;
  const body = JSON.stringify({ reason, url: tab.url, userAgent, version });
  const headers = { 'Content-type': 'application/json' };
  const url = `${apiUrl}/report/`;

  await fetch(url, { body, headers, method: 'POST' });
};

/**
 * @description Listens to context menus clicked
 */

chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case reportMenuItemId:
      if (tab) chrome.tabs.sendMessage(tab.id, { type: 'SHOW_REPORT_DIALOG' });
      break;
    default:
      break;
  }
});

/**
 * @description Listens to messages
 */

chrome.runtime.onMessage.addListener((message, sender, callback) => {
  const hostname = message.hostname;
  const isPage = sender.frameId === 0;
  const tabId = sender.tab?.id;

  switch (message.type) {
    case 'DISABLE_ICON':
      if (isPage && tabId) chrome.action.setIcon({ path: '/assets/icons/disabled.png', tabId });
      break;
    case 'ENABLE_ICON':
      if (isPage && tabId) chrome.action.setIcon({ path: '/assets/icons/enabled.png', tabId });
      break;
    case 'ENABLE_POPUP':
      if (isPage && tabId) chrome.action.setPopup({ popup: '/popup.html', tabId });
      break;
    case 'GET_DATA':
      storage.get('data', ({ data }) => (data ? callback(data) : refreshData(callback)));
      return true;
    case 'GET_STATE':
      if (hostname) storage.get(hostname, (state) => callback(state[hostname] ?? initial));
      return true;
    case 'GET_TAB':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => callback(tabs[0]));
      return true;
    case 'INSERT_CONTENT_CSS':
      if (isPage && tabId) script.insertCSS({ files: ['styles/content.css'], target: { tabId } });
      break;
    case 'INSERT_DIALOG_CSS':
      if (isPage && tabId) script.insertCSS({ files: ['styles/dialog.css'], target: { tabId } });
      break;
    case 'REPORT':
      if (tabId) report(message, sender.tab);
      break;
    case 'UPDATE_STATE':
      if (hostname) storage.set({ [hostname]: message.state });
      break;
    default:
      break;
  }
});

/**
 * @description Listens to extension installed
 */

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    contexts: ['all'],
    documentUrlPatterns: chrome.runtime.getManifest().content_scripts[0].matches,
    id: reportMenuItemId,
    title: chrome.i18n.getMessage('contextMenu_reportOption'),
  });
});

/**
 * @description Listens to first start
 */

chrome.runtime.onStartup.addListener(() => {
  refreshData();
});
