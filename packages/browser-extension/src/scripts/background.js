/**
 * @typedef {Object} ExtensionIssue
 * @property {number} [expiresIn]
 * @property {string[]} [flags]
 * @property {string} [url]
 */

/**
 * @typedef {Object} ExtensionState
 * @property {ExtensionIssue} [issue]
 * @property {boolean} on
 */

if (typeof browser === 'undefined') {
  browser = chrome;
}

/**
 * @description Class for request batching
 */
class RequestManager {
  constructor() {
    this.requests = new Map(); // Store ongoing requests
  }

  /**
   * @description Fetch wrapper to play with the request map
   * @param {string} input
   * @param {RequestInit} [init]
   * @returns {Promise<any>}
   */
  fetchData(input, init) {
    if (this.requests.has(input)) {
      return this.requests.get(input);
    }

    const promise = fetch(input, init)
      .then((response) => response.json())
      .finally(() => this.requests.delete(input));

    this.requests.set(input, promise);

    return promise;
  }
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
 * @description Request manager instance
 */
const requestManager = new RequestManager();

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
 * @description Default value for extension state
 * @type {ExtensionState}
 */
const stateByDefault = { issue: { expiresIn: 0 }, on: true };

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
 * @async
 * @description Enable extension icon
 * @param {number} tabId
 * @returns {Promise<void>}
 */
async function enableIcon(hostname, tabId) {
  const state = await getState(hostname);
  const path = state.issue.url ? '/assets/icons/warn.png' : '/assets/icons/on.png';

  await browser.action.setIcon({ path, tabId }, suppressLastError);
}

/**
 * @async
 * @description Get database
 * @returns {Promise<Object>}
 */
async function getData() {
  const { data } = await storage.get('data');

  if (!data) {
    return await refreshData();
  }

  return data;
}

/**
 * @description Calculate current hostname
 * @param {string} url
 * @returns {string}
 */
function getHostname(url) {
  return new URL(url).hostname.split('.').slice(-3).join('.').replace('www.', '');
}

/**
 * @async
 * @description Get state for the given hostname
 * @param {string} hostname
 * @returns {Promise<ExtensionState>}
 */
async function getState(hostname) {
  const { [hostname]: state = stateByDefault } = await storage.get(hostname);

  if ((state.issue && Date.now() > state.issue.expiresIn) || !state.issue?.expiresIn) {
    state.issue = await refreshIssue(hostname);
  }

  return { ...stateByDefault, ...state };
}

/**
 * @description Format number to avoid errors
 * @param {number} [value]
 * @returns {string | null}
 */
function formatNumber(value) {
  if (value) {
    if (value >= 1e6) {
      return `${Math.floor(value / 1e6)}M`;
    } else if (value >= 1e3) {
      return `${Math.floor(value / 1e3)}K`;
    } else {
      return value.toString();
    }
  }

  return null;
}

/**
 * @description Convert match string to pattern string
 * @param {string} match
 * @returns {string}
 */
function matchToPattern(match) {
  return `^${match.replaceAll('*.', '*(.)?').replaceAll('*', '.*')}$`;
}

/**
 * @async
 * @description Refresh data
 * @returns {Promise<void>}
 */
async function refreshData() {
  try {
    const { data } = await requestManager.fetchData(`${apiUrl}/data/`);

    await triggerStoreUpdate('data', data);

    return data;
  } catch {
    return await refreshData();
  }
}

/**
 * @async
 * @description Refresh issues for the given hostname
 * @param {string} hostname
 * @returns {Promise<ExtensionIssue | undefined>}
 */
async function refreshIssue(hostname) {
  try {
    const { data } = await requestManager.fetchData(`${apiUrl}/issues/${hostname}`);

    if (Object.keys(data).length === 0) {
      await triggerStoreUpdate(hostname, { issue: { expiresIn: Date.now() + 8 * 60 * 60 * 1000 } });

      return undefined;
    }

    const issue = { expiresIn: Date.now() + 4 * 60 * 60 * 1000, flags: data.flags, url: data.url };

    await triggerStoreUpdate(hostname, { issue });

    return data;
  } catch {
    return await refreshData();
  }
}

/**
 * @async
 * @description Report active tab URL
 * @param {any} message
 * @param {browser.tabs.Tab} tab
 * @param {void?} callback
 * @returns {Promise<void>}
 */
async function report(message) {
  try {
    const reason = message.reason;
    const url = message.url;
    const userAgent = message.userAgent;
    const version = browser.runtime.getManifest().version;
    const body = JSON.stringify({ reason, url, userAgent, version });
    const headers = { 'Cache-Control': 'no-cache', 'Content-type': 'application/json' };
    const requestInit = { body, headers, method: 'POST' };

    return (await requestManager.fetchData(`${apiUrl}/report/`, requestInit)).data;
  } catch {
    console.error("Can't send report");
  }
}

/**
 * @async
 * @description Update extension store for a given key
 * @param {string} [key]
 * @param {Object} value
 * @returns {Promise<void>}
 */
async function triggerStoreUpdate(key, value) {
  if (key) {
    const { [key]: prev } = await storage.get(key);

    await storage.set({ [key]: { ...prev, ...value } }, suppressLastError);
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
        browser.action.setIcon({ path: '/assets/icons/off.png', tabId }, suppressLastError);
      }
      break;
    case 'ENABLE_ICON':
      if (isPage && tabId !== undefined) enableIcon(hostname, tabId);
      break;
    case 'ENABLE_POPUP':
      if (isPage && tabId !== undefined) {
        browser.action.setPopup({ popup: '/popup.html', tabId }, suppressLastError);
      }
      break;
    case 'GET_DATA':
      getData().then(callback);
      return true;
    case 'GET_EXCLUSION_LIST':
      storage.get(null, (exclusions) => {
        const exclusionList = Object.entries(exclusions || {}).flatMap((exclusion) =>
          exclusion[0] !== 'data' && !exclusion[1]?.on ? [exclusion[0]] : []
        );
        callback(exclusionList);
      });
      return true;
    case 'GET_STATE':
      if (hostname) {
        getState(hostname).then(callback);
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
      refreshData().then(callback);
      return true;
    case 'REPORT':
      if (tabId !== undefined) {
        report(message).then(callback);
        return true;
      }
      break;
    case 'UPDATE_BADGE':
      if (isPage && tabId !== undefined) {
        browser.action.setBadgeBackgroundColor({ color: '#6b7280' });
        browser.action.setBadgeText({ tabId, text: formatNumber(message.value) });
      }
      break;
    case 'UPDATE_STORE':
      triggerStoreUpdate(hostname, message.state);
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

      const data = await getData();
      const hostname = getHostname(url);
      const state = await getState(hostname);

      if (data?.rules?.length) {
        const rules = data.rules.map((rule) => ({
          ...rule,
          condition: { ...rule.condition, tabIds: [tabId] },
        }));

        await browser.declarativeNetRequest.updateSessionRules({
          addRules: state.on ? rules : undefined,
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

    if (error === 'net::ERR_BLOCKED_BY_CLIENT' && tabId > -1) {
      const hostname = getHostname(url);
      const state = await getState(hostname);

      if (state.on) {
        await browser.tabs.sendMessage(tabId, { type: 'INCREASE_ACTIONS_COUNT' });
      }
    }
  },
  { urls: ['<all_urls>'] }
);
