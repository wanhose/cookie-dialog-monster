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
 * @function disableIcon
 * @description Disables icon
 *
 * @param {string} [tabId]
 */

const disableIcon = (tabId) => {
  chrome.browserAction.setIcon({
    path: "assets/icons/disabled.png",
    tabId,
  });
};

/**
 * @function disablePopup
 * @description Disables popup
 *
 * @param {string} [tabId]
 */

const disablePopup = (tabId) => {
  chrome.browserAction.setPopup({
    popup: "",
    tabId,
  });
};

/**
 * @function enableIcon
 * @description Enables icon
 *
 * @param {string} [tabId]
 */

const enableIcon = (tabId) => {
  chrome.browserAction.setIcon({
    path: "assets/icons/enabled.png",
    tabId,
  });
};

/**
 * @function enablePopup
 * @description Enables popup
 *
 * @param {string} [tabId]
 */

const enablePopup = (tabId) => {
  chrome.browserAction.setPopup({
    popup: "popup.html",
    tabId,
  });
};

/**
 * @async
 * @function getCache
 * @description Retrieves cache state
 *
 * @returns {Promise<{ enabled: boolean, matches: string[] }>} Cache state
 */

const getCache = async (hostname, responseCallback) => {
  chrome.storage.local.get(null, (store) => {
    const cache = store[hostname];

    if (cache) {
      responseCallback(cache);
    } else {
      chrome.storage.local.set({ [hostname]: cacheInitialState });
      responseCallback(cacheInitialState);
    }
  });
};

/**
 * @async
 * @function updateCache
 * @description Update cache state
 */

const updateCache = async (hostname, selector) => {
  chrome.storage.local.get(null, (cache) => {
    const current = cache[hostname];

    chrome.storage.local.set({
      [hostname]: {
        ...current,
        matches: [...new Set([...current.matches, selector])],
      },
    });
  });
};

/**
 * @async
 * @function getList
 * @description Retrieves selectors list
 *
 * @returns {Promise<{ matches: string[] }>} A selectors list
 */

const getList = async (responseCallback) => {
  try {
    const url =
      "https://raw.githubusercontent.com/wanhose/do-not-consent/master/data/elements.txt";
    const response = await fetch(url);
    const data = await response.text();

    if (response.status !== 200) throw new Error();

    responseCallback({ matches: data.split("\n") });
  } catch {
    responseCallback({ matches: [] });
  }
};

/**
 * @description Listens to content messages
 */

chrome.runtime.onMessage.addListener((request, sender, responseCallback) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const tabId = tab.id;

    switch (request.type) {
      case "DISABLE_ICON":
        disableIcon(tabId);
        break;
      case "DISABLE_POPUP":
        disablePopup(tabId);
        break;
      case "ENABLE_ICON":
        enableIcon(tabId);
        break;
      case "ENABLE_POPUP":
        enablePopup(tabId);
        break;
      case "GET_CACHE":
        getCache(request.hostname, responseCallback);
        break;
      case "GET_LIST":
        getList(responseCallback);
        break;
      case "UPDATE_CACHE":
        updateCache(request.hostname, request.selector);
        break;
      default:
        break;
    }
  });

  return true;
});
