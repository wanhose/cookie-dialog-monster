/**
 * @var cacheInitialState
 * @description Cache initial state
 * @type {{ enabled: boolean, matches: string[] }}
 */

const cacheInitialState = {
  enabled: true,
  matches: [],
};

/**
 * @function isValid
 * @description Check cache validity
 *
 * @param {object} [cache]
 */

const isValid = (cache) =>
  typeof cache.enabled === "boolean" &&
  Array.isArray(cache.matches) &&
  cache.matches.every((match) => typeof match === "string");

/**
 * @function disableIcon
 * @description Disables icon if there is a tab
 *
 * @param {string} [tabId]
 */

const disableIcon = (tabId) => {
  if (tabId) {
    chrome.browserAction.setIcon({
      path: "assets/icons/disabled.png",
      tabId,
    });
  }
};

/**
 * @function disablePopup
 * @description Disables popup if there is a tab
 *
 * @param {string} [tabId]
 */

const disablePopup = (tabId) => {
  if (tabId) {
    chrome.browserAction.setPopup({
      popup: "",
      tabId,
    });
  }
};

/**
 * @function enableIcon
 * @description Enables icon if there is a tab
 *
 * @param {string} [tabId]
 */

const enableIcon = (tabId) => {
  if (tabId) {
    chrome.browserAction.setIcon({
      path: "assets/icons/enabled.png",
      tabId,
    });
  }
};

/**
 * @function enablePopup
 * @description Enables popup if there is a tab
 *
 * @param {string} [tabId]
 */

const enablePopup = (tabId) => {
  if (tabId) {
    chrome.browserAction.setPopup({
      popup: "popup.html",
      tabId,
    });
  }
};

/**
 * @function getCache
 * @description Retrieves cache state
 *
 * @param {string} [hostname]
 * @param {void} [responseCallback]
 * @returns {Promise<{ enabled: boolean, matches: string[] }>} Cache state
 */

const getCache = (hostname, responseCallback) => {
  chrome.storage.local.get(null, (store) => {
    try {
      const cache = store[hostname];

      if (!isValid(cache)) throw new Error();

      responseCallback(cache);
    } catch {
      chrome.storage.local.set({ [hostname]: cacheInitialState });
      responseCallback(cacheInitialState);
    }
  });
};

/**
 * @function getTab
 * @description Retrieves current tab information
 *
 * @param {void} [responseCallback]
 * @returns {Promise<{ id: string, location: string }>} Current tab information
 */

const getTab = (responseCallback) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    responseCallback({
      id: tabs[0].id,
      hostname: new URL(tabs[0].url).hostname,
    });
  });
};

/**
 * @async
 * @function getList
 * @description Retrieves selectors list
 *
 * @param {void} [responseCallback]
 * @returns {Promise<{ matches: string[] }>} A selectors list
 */

const getList = async (responseCallback) => {
  try {
    const url =
      "https://raw.githubusercontent.com/wanhose/do-not-consent/master/data/elements.txt";
    const response = await fetch(url);
    const data = await response.text();

    if (response.status !== 200) throw new Error();

    responseCallback({ selectors: data.split("\n") });
  } catch {
    responseCallback({ selectors: [] });
  }
};

/**
 * @function updateCache
 * @description Update cache state
 *
 * @param {string} [hostname]
 * @param {object} [state]
 */

const updateCache = (hostname, state) => {
  chrome.storage.local.get(null, (cache) => {
    const current = cache[hostname];

    chrome.storage.local.set({
      [hostname]: {
        enabled:
          typeof state.enabled === "undefined"
            ? current.enabled
            : state.enabled,
        matches:
          typeof state.matches === "undefined"
            ? current.matches
            : [...new Set([...current.matches, ...state.matches])],
      },
    });
  });
};

/**
 * @function updateState
 * @description Set an extension state
 *
 * @param {string} [tabId]
 * @param {string} [state]
 */

const updateState = (tabId, state) => {
  switch (state) {
    case "loading":
      chrome.tabs.insertCSS(tabId, {
        file: "styles/content.css",
        runAt: "document_start",
      });
      break;
    case "ready":
      chrome.tabs.removeCSS(tabId, {
        file: "styles/content.css",
      });
      break;
    default:
      break;
  }
};

/**
 * @description Listens to content messages
 */

chrome.runtime.onMessage.addListener((request, sender, responseCallback) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const hasPermission = !sender.frameId || sender.frameId === 0;
    const tab = tabs[0];
    const tabId = tab ? tab.id : undefined;

    switch (request.type) {
      case "DISABLE_ICON":
        if (hasPermission) disableIcon(tabId);
        break;
      case "DISABLE_POPUP":
        if (hasPermission) disablePopup(tabId);
        break;
      case "ENABLE_ICON":
        if (hasPermission) enableIcon(tabId);
        break;
      case "ENABLE_POPUP":
        if (hasPermission) enablePopup(tabId);
        break;
      case "GET_CACHE":
        getCache(request.hostname, responseCallback);
        break;
      case "GET_LIST":
        getList(responseCallback);
        break;
      case "GET_TAB":
        getTab(responseCallback);
        break;
      case "UPDATE_CACHE":
        updateCache(request.hostname, request.state);
        break;
      case "UPDATE_STATE":
        if (hasPermission) updateState(tabId, request.state);
        break;
      default:
        break;
    }
  });

  return true;
});
