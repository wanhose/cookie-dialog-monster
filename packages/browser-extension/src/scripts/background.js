/**
 * @typedef {Object} ExtensionIssue
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
    this.requests = new Map();
  }

  /**
   * @description Fetch wrapper to play with the request map
   * @param {string} input
   * @param {RequestInit} [init]
   * @returns {Promise<any>}
   */
  fetch(input, init) {
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
const apiUrl = 'https://api.cookie-dialog-monster.com/rest/v6';

/**
 * @description Request manager instance
 */
const requestManager = new RequestManager();

/**
 * @description Default value for extension state
 * @type {ExtensionState}
 */
const stateByDefault = { issue: undefined, on: true };

/**
 * @description The storage to use
 * @type {browser.storage.StorageArea}
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
  const path = state.issue?.url ? '/assets/icons/warn.png' : '/assets/icons/on.png';

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
 * @description Get current hostname
 * @param {string} url
 * @returns {string}
 */
function getHostname(url) {
  return new URL(url).hostname.split('.').slice(-3).join('.').replace('www.', '');
}

/**
 * @async
 * @description Get current active tab
 * @returns {Promise<browser.tabs.Tab>}
 */
async function getTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });

  return tabs[0];
}

/**
 * @async
 * @description Get state for the given hostname
 * @param {string} hostname
 * @returns {Promise<ExtensionState>}
 */
async function getState(hostname) {
  const { [hostname]: state = stateByDefault } = await storage.get(hostname);

  // state.issue = await refreshIssue(hostname);

  return { ...stateByDefault, ...state };
}

/**
 * @async
 * @description Get latest version available for this extension
 * @returns {Promise<string>}
 */
async function getLatestVersion() {
  try {
    const { data } = await requestManager.fetch(`${apiUrl}/version/`);

    return data;
  } catch {
    return '';
  }
}

/**
 * @description Normalize custom declarative request
 * @param {string} urlFilter
 * @param {index} number
 * @returns {browser.declarativeNetRequest.Rule}
 */
function toDeclarativeNetRequestRule(urlFilter, index) {
  return {
    action: {
      type: 'block',
    },
    condition: {
      resourceTypes: ['font', 'image', 'media', 'object', 'script', 'stylesheet', 'xmlhttprequest'],
      urlFilter,
    },
    id: index + 1,
    priority: 1,
  };
}

/**
 * @async
 * @description Refresh data
 * @param {number} [attempt]
 * @returns {Promise<void>}
 */
async function refreshData(attempt = 1) {
  if (attempt <= 3) {
    try {
      // const { data } = await requestManager.fetch(`${apiUrl}/data/`);
      const database =
        'https://raw.githubusercontent.com/wanhose/cookie-dialog-monster/refs/heads/main/database.json';
      const options = { headers: { 'Cache-Control': 'no-cache' } };
      const response = await fetch(database, options);
      const { rules, ...rest } = await response.json();
      const data = { ...rest, rules: rules.map(toDeclarativeNetRequestRule) };

      await updateStore('data', data);

      return data;
    } catch {
      return await refreshData(attempt + 1);
    }
  }
}

/**
 * @async
 * @description Refresh issues for the given hostname
 * @param {string} hostname
 * @param {number} [attempt]
 * @returns {Promise<ExtensionIssue | undefined>}
 */
async function refreshIssue(hostname, attempt = 1) {
  if (attempt <= 3) {
    try {
      const { data = {} } = await requestManager.fetch(`${apiUrl}/issues/${hostname}/`);
      await updateStore(hostname, { issue: { flags: data.flags, url: data.url } });

      return data;
    } catch {
      return await refreshIssue(hostname, attempt + 1);
    }
  }
}

/**
 * @async
 * @description Report given page
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

    return await requestManager.fetch(`${apiUrl}/report/`, requestInit);
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
async function updateStore(key, value) {
  if (key) {
    const { [key]: prev } = await storage.get(key);

    await storage.set({ [key]: { ...prev, ...value } }, suppressLastError);
  }
}

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
      if (isPage && tabId !== undefined) {
        enableIcon(hostname, tabId).then(callback);
        return true;
      }
      break;
    case 'GET_DATA':
      getData().then(callback);
      return true;
    case 'GET_EXCLUSION_LIST':
      storage.get(null, (exclusions) => {
        const exclusionList = Object.entries(exclusions || {}).flatMap((exclusion) => {
          return exclusion[0] !== 'data' && exclusion[1].on === false ? [exclusion[0]] : [];
        });
        callback(exclusionList);
      });
      return true;
    case 'GET_LATEST_VERSION':
      // getLatestVersion().then(callback);
      // return true;
      break;
    case 'GET_STATE':
      if (hostname) {
        getState(hostname).then(callback);
        return true;
      }
      break;
    case 'GET_TAB':
      getTab().then(callback);
      return true;
    case 'REFRESH_DATA':
      refreshData().then(callback);
      return true;
    case 'REPORT':
      // report(message).then(callback);
      // return true;
      break;
    case 'UPDATE_BADGE':
      if (isPage && tabId !== undefined) {
        browser.action.setBadgeBackgroundColor({ color: '#6b7280' });
        browser.action.setBadgeText({ tabId, text: message.value ? `${message.value}` : null });
      }
      break;
    case 'UPDATE_STORE':
      updateStore(hostname, message.state).then(callback);
      return true;
    default:
      break;
  }
});

/**
 * @description Listens to extension installed
 */
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'update') {
    refreshData();
  }
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
      const { exclusions, rules } = await getData();

      if (exclusions.domains.some((x) => location.hostname.match(x.replaceAll(/\*/g, '[^ ]*')))) {
        return;
      }

      const hostname = getHostname(url);
      const state = await getState(hostname);

      if (rules?.length) {
        const rulesWithTabId = rules.map((rule) => ({
          ...rule,
          condition: { ...rule.condition, tabIds: [tabId] },
        }));

        await browser.declarativeNetRequest.updateSessionRules({
          addRules: state.on ? rulesWithTabId : undefined,
          removeRuleIds: rules.map((rule) => rule.id),
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
    const { error, tabId } = details;

    if (error === 'net::ERR_BLOCKED_BY_CLIENT' && tabId > -1) {
      await browser.tabs.sendMessage(tabId, { type: 'INCREASE_ACTIONS_COUNT', value: error });
    }
  },
  { urls: ['<all_urls>'] }
);
