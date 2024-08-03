if (typeof browser === 'undefined') {
  browser = chrome;
}

/**
 * @description API URL
 * @type {string}
 */
const apiUrl = 'https://api.cookie-dialog-monster.com/rest/v4';

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
 * @description A shortcut for browser.scripting
 * @type {browser.scripting}
 */
const script = browser.scripting;

/**
 * @description The storage to use
 * @type {browser.storage.LocalStorageArea}
 */
const storage = browser.storage.local;

/**
 * @description Refresh data
 * @param {void?} callback
 */
const refreshData = (callback) => {
  try {
    fetch(`${apiUrl}/data/`).then((result) => {
      result.json().then(({ data }) => {
        storage.set({ data }, suppressLastError);
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
 * @param {browser.tabs.Tab} tab
 * @param {void?} callback
 */
const report = async (message, tab, callback) => {
  try {
    const reason = message.reason;
    const userAgent = message.userAgent;
    const version = browser.runtime.getManifest().version;
    const body = JSON.stringify({ reason, url: tab.url, userAgent, version });
    const headers = { 'Content-type': 'application/json' };
    const url = `${apiUrl}/report/`;

    const response = await fetch(url, { body, headers, method: 'POST' });
    callback?.((await response.json()).data);
  } catch {
    console.error("Can't send report");
  }
};

/**
 * @description Supress `browser.runtime.lastError`
 */
const suppressLastError = () => void browser.runtime.lastError;

/**
 * @description Listen to context menus clicked
 */
browser.contextMenus.onClicked.addListener((info, tab) => {
  const tabId = tab?.id;

  switch (info.menuItemId) {
    case reportMenuItemId:
      if (tabId !== undefined) {
        browser.tabs.sendMessage(tabId, { type: 'SHOW_REPORT_DIALOG' }, suppressLastError);
      }
      break;
    case settingsMenuItemId:
      browser.runtime.openOptionsPage();
      break;
    default:
      break;
  }
});

/**
 * @description Listens to messages
 */
browser.runtime.onMessage.addListener((message, sender, callback) => {
  const hostname = message.hostname;
  const isPage = sender.frameId === 0;
  const tabId = sender.tab?.id;

  switch (message.type) {
    case 'DISABLE_ICON':
      if (isPage && tabId !== undefined) {
        browser.action.setIcon({ path: '/assets/icons/disabled.png', tabId }, suppressLastError);
        browser.action.setBadgeText({ tabId, text: '' });
      }
      break;
    case 'ENABLE_ICON':
      if (isPage && tabId !== undefined) {
        browser.action.setIcon({ path: '/assets/icons/enabled.png', tabId }, suppressLastError);
      }
      break;
    case 'ENABLE_POPUP':
      if (isPage && tabId !== undefined) {
        browser.action.setPopup({ popup: '/popup.html', tabId }, suppressLastError);
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
        const exclusionList = Object.entries(exclusions || {}).flatMap((exclusion) =>
          exclusion[0] !== 'data' && !exclusion[1]?.enabled ? [exclusion[0]] : []
        );
        callback(exclusionList);
      });
      return true;
    case 'GET_HOSTNAME_STATE':
      if (hostname) {
        storage.get(hostname, (state) => {
          callback(state[hostname] ?? { enabled: true });
        });
        return true;
      }
      break;
    case 'GET_TAB':
      browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        callback(tabs[0]);
      });
      return true;
    case 'INSERT_DIALOG_CSS':
      if (isPage && tabId !== undefined) {
        script.insertCSS({ files: ['styles/dialog.css'], target: { tabId } });
      }
      break;
    case 'REFRESH_DATA':
      refreshData(callback);
      return true;
    case 'REPORT':
      if (tabId !== undefined) {
        report(message, sender.tab, callback);
        return true;
      }
      break;
    case 'SET_BADGE':
      if (tabId !== undefined) {
        browser.action.setBadgeBackgroundColor({ color: '#6b7280' });
        browser.action.setBadgeText({ tabId, text: message.value });
      }
      break;
    case 'SET_HOSTNAME_STATE':
      if (hostname) {
        if (message.state.enabled === false) {
          storage.set({ [hostname]: message.state });
        } else {
          storage.remove(hostname);
        }
      }
      break;
    default:
      break;
  }
});

/**
 * @description Listens to extension installed
 */
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create(
    {
      contexts: ['all'],
      documentUrlPatterns: browser.runtime.getManifest().content_scripts[0].matches,
      id: extensionMenuItemId,
      title: 'Cookie Dialog Monster',
    },
    suppressLastError
  );
  browser.contextMenus.create(
    {
      contexts: ['all'],
      documentUrlPatterns: browser.runtime.getManifest().content_scripts[0].matches,
      id: settingsMenuItemId,
      parentId: extensionMenuItemId,
      title: browser.i18n.getMessage('contextMenu_settingsOption'),
    },
    suppressLastError
  );
  browser.contextMenus.create(
    {
      contexts: ['all'],
      documentUrlPatterns: browser.runtime.getManifest().content_scripts[0].matches,
      id: reportMenuItemId,
      parentId: extensionMenuItemId,
      title: browser.i18n.getMessage('contextMenu_reportOption'),
    },
    suppressLastError
  );
});

/**
 * @description Listen to first start
 */
browser.runtime.onStartup.addListener(() => {
  refreshData();
});
