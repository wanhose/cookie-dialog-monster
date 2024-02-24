/**
 * @description API URL
 * @type {string}
 */
const apiUrl = 'https://api.cookie-dialog-monster.com/rest/v2';

/**
 * @description Context menu identifier
 * @type {string}
 */
const extensionMenuItemId = 'CDM-MENU';

/**
 * @description Context menu identifier
 * @type {string}
 */
const reportMenuItemId = 'CDM-REPORT';

/**
 * @description Context menu identifier
 * @type {string}
 */
const settingsMenuItemId = 'CDM-SETTINGS';

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
 * @description Refresh data
 * @param {void?} callback
 */
const refreshData = (callback) => {
  try {
    fetch(`${apiUrl}/data/`).then((result) => {
      result.json().then(({ data }) => {
        chrome.storage.local.set({ data }, suppressLastError);
        callback?.(data);
      });
    });
  } catch {
    refreshData(callback);
  }
};

/**
 * @async
 * @description Report active tab URL
 * @param {any} message
 * @param {chrome.tabs.Tab} tab
 */
const report = async (message, tab) => {
  try {
    const reason = message.reason;
    const userAgent = message.userAgent;
    const version = chrome.runtime.getManifest().version;
    const body = JSON.stringify({ reason, url: tab.url, userAgent, version });
    const headers = { 'Content-type': 'application/json' };
    const url = `${apiUrl}/report/`;

    await fetch(url, { body, headers, method: 'POST' });
  } catch {
    console.error("Can't send report");
  }
};

/**
 * @description Supress `chrome.runtime.lastError`
 */
const suppressLastError = () => void chrome.runtime.lastError;

/**
 * @description Listen to context menus clicked
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const tabId = tab?.id;

  switch (info.menuItemId) {
    case reportMenuItemId:
      if (tabId) chrome.tabs.sendMessage(tabId, { type: 'SHOW_REPORT_DIALOG' }, suppressLastError);
      break;
    case settingsMenuItemId:
      chrome.runtime.openOptionsPage();
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
      if (isPage && tabId) {
        chrome.action.setIcon({ path: '/assets/icons/disabled.png', tabId }, suppressLastError);
      }
      break;
    case 'ENABLE_ICON':
      if (isPage && tabId) {
        chrome.action.setIcon({ path: '/assets/icons/enabled.png', tabId }, suppressLastError);
      }
      break;
    case 'ENABLE_POPUP':
      if (isPage && tabId) {
        chrome.action.setPopup({ popup: '/popup.html', tabId }, suppressLastError);
      }
      break;
    case 'GET_DATA':
      storage.get('data', ({ data }) => {
        if (data) {
          callback(data);
        } else {
          refreshData(callback);
        }
      });
      return true;
    case 'GET_EXCLUSION_LIST':
      storage.get(null, (exclusions) => {
        const exclusionList = Object.entries(exclusions || {}).flatMap((x) =>
          x[0] !== 'data' && !x[1]?.enabled ? [x[0]] : []
        );
        callback(exclusionList);
      });
      return true;
    case 'GET_HOSTNAME_STATE':
      if (hostname) {
        storage.get(hostname, (state) => {
          callback(state[hostname] ?? { enabled: true });
        });
      }
      return true;
    case 'GET_TAB':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        callback(tabs[0]);
      });
      return true;
    case 'INSERT_DIALOG_CSS':
      if (isPage && tabId) {
        script.insertCSS({ files: ['styles/dialog.css'], target: { tabId } });
      }
      break;
    case 'REPORT':
      if (tabId) {
        report(message, sender.tab);
      }
      break;
    case 'SET_HOSTNAME_STATE':
      if (hostname && message.state.enabled === false) {
        storage.set({ [hostname]: message.state });
      } else if (hostname) {
        storage.remove(hostname);
      }
      break;
    default:
      break;
  }
});

/**
 * @description Listens to extension installed
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create(
    {
      contexts: ['all'],
      documentUrlPatterns: chrome.runtime.getManifest().content_scripts[0].matches,
      id: extensionMenuItemId,
      title: 'Cookie Dialog Monster',
    },
    suppressLastError
  );
  chrome.contextMenus.create(
    {
      contexts: ['all'],
      documentUrlPatterns: chrome.runtime.getManifest().content_scripts[0].matches,
      id: settingsMenuItemId,
      parentId: extensionMenuItemId,
      title: chrome.i18n.getMessage('contextMenu_settingsOption'),
    },
    suppressLastError
  );
  chrome.contextMenus.create(
    {
      contexts: ['all'],
      documentUrlPatterns: chrome.runtime.getManifest().content_scripts[0].matches,
      id: reportMenuItemId,
      parentId: extensionMenuItemId,
      title: chrome.i18n.getMessage('contextMenu_reportOption'),
    },
    suppressLastError
  );
});

/**
 * @description Listen to first start
 */
chrome.runtime.onStartup.addListener(() => {
  refreshData();
});
