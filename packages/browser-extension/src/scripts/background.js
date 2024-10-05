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
 * @description Supress `browser.runtime.lastError`
 */
const suppressLastError = () => void browser.runtime.lastError;

/**
 * @description Map match to pattern format
 * @param {string} match
 * @returns {string}
 */
function matchToPattern(match) {
  return `^${match.replaceAll('*.', '*(.)?').replaceAll('*', '.*')}$`;
}

/**
 * @description Refresh data
 * @param {void?} callback
 * @returns {void}
 */
function refreshData(callback) {
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
}

/**
 * @async
 * @description Report active tab URL
 * @param {any} message
 * @param {browser.tabs.Tab} tab
 * @param {void?} callback
 * @returns {void}
 */
async function report(message, tab, callback) {
  try {
    const reason = message.reason;
    const url = message.url;
    const userAgent = message.userAgent;
    const version = browser.runtime.getManifest().version;
    const body = JSON.stringify({ reason, url, userAgent, version });
    const headers = { 'Cache-Control': 'no-cache', 'Content-type': 'application/json' };

    const response = await fetch(`${apiUrl}/report/`, { body, headers, method: 'POST' });
    callback?.((await response.json()).data);
  } catch {
    console.error("Can't send report");
  }
}

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
        if (data) callback(data);
        else refreshData(callback);
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
      if (isPage && tabId !== undefined) {
        browser.action.setBadgeBackgroundColor({ color: '#6b7280' });
        browser.action.setBadgeText({ tabId, text: message.value ? `${message.value}` : null });
      }
      break;
    case 'SET_HOSTNAME_STATE':
      if (hostname) {
        if (message.state.enabled === false) storage.set({ [hostname]: message.state });
        else storage.remove(hostname);
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
  const documentUrlPatterns = browser.runtime.getManifest().content_scripts[0].matches;

  browser.contextMenus.create(
    {
      contexts: ['all'],
      documentUrlPatterns,
      id: extensionMenuItemId,
      title: 'Cookie Dialog Monster',
    },
    suppressLastError
  );
  browser.contextMenus.create(
    {
      contexts: ['all'],
      documentUrlPatterns,
      id: settingsMenuItemId,
      parentId: extensionMenuItemId,
      title: browser.i18n.getMessage('contextMenu_settingsOption'),
    },
    suppressLastError
  );
  browser.contextMenus.create(
    {
      contexts: ['all'],
      documentUrlPatterns,
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

/**
 * @description Listen to the moment before a request is made to apply the rules
 * @returns {Promise<void>}
 */
browser.webRequest.onBeforeRequest.addListener(
  async (details) => {
    const { tabId, type, url } = details;

    if (tabId > -1 && type === 'main_frame') {
      const manifest = browser.runtime.getManifest();
      const excludeMatches = manifest.content_scripts[0].exclude_matches;
      const excludePatterns = excludeMatches.map(matchToPattern);

      if (excludePatterns.some((pattern) => new RegExp(pattern).test(url))) {
        return;
      }

      const hostname = new URL(url).hostname.split('.').slice(-3).join('.').replace('www.', '');
      const { data, ...store } = await storage.get(['data', hostname]);
      const state = store[hostname] ?? { enabled: true };

      if (data?.rules?.length) {
        const rules = data.rules.map((rule) => ({
          ...rule,
          condition: { ...rule.condition, tabIds: [tabId] },
        }));

        await browser.declarativeNetRequest.updateSessionRules({
          addRules: state.enabled ? rules : undefined,
          removeRuleIds: data.rules.map((rule) => rule.id),
        });
      }
    }
  },
  { urls: ['<all_urls>'] }
);

/**
 * @description Listen for errors on network requests
 */
browser.webRequest.onErrorOccurred.addListener(
  async (details) => {
    const { error, tabId, url } = details;

    if (tabId > -1) {
      const hostname = new URL(url).hostname.split('.').slice(-3).join('.').replace('www.', '');
      const { data, ...store } = await storage.get(['data', hostname]);
      const state = store[hostname] ?? { enabled: true };

      if (error === 'net::ERR_BLOCKED_BY_CLIENT' && state.enabled) {
        const sessionRules = await browser.declarativeNetRequest.getSessionRules();

        if (sessionRules.some((rule) => new RegExp(rule.condition.urlFilter).test(url))) {
          await browser.tabs.sendMessage(tabId, { type: 'INCREASE_ACTIONS_COUNT' });
        }
      }
    }
  },
  { urls: ['<all_urls>'] }
);
