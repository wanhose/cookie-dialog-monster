/**
 * @description Context menu identifier
 * @type {string}
 */

const contextMenuId = "CDM_MENU";

/**
 * @description Cache initial state
 * @type {{ enabled: boolean }}
 */

const initial = { enabled: true };

/**
 * @description Disables icon
 * @param {string} [tabId]
 */

const disableIcon = (tabId) => {
  chrome.browserAction.setIcon({
    path: "assets/icons/disabled.png",
    tabId,
  });
};

/**
 * @description Disables popup
 * @param {string} [tabId]
 */

const disablePopup = (tabId) => {
  chrome.browserAction.setPopup({
    popup: "",
    tabId,
  });
};

/**
 * @description Enables icon
 * @param {string} [tabId]
 */

const enableIcon = (tabId) => {
  chrome.browserAction.setIcon({
    path: "assets/icons/enabled.png",
    tabId,
  });
};

/**
 * @description Enables popup
 * @param {string} [tabId]
 */

const enablePopup = (tabId) => {
  chrome.browserAction.setPopup({
    popup: "popup.html",
    tabId,
  });
};

/**
 * @description Retrieves cache state
 * @param {string} [hostname]
 * @param {void} [callback]
 * @returns {Promise<{ enabled: boolean }>}
 */

const getCache = (hostname, callback) => {
  chrome.storage.local.get(null, (store) => {
    callback(store[hostname] ?? initial);
  });
};

/**
 * @async
 * @description Retrieves a selectors list
 * @param {void} [callback]
 * @returns {Promise<{ classes: string[] }>}
 */

const getClasses = async (callback) => {
  try {
    const url =
      "https://raw.githubusercontent.com/wanhose/cookie-dialog-monster/master/data/classes.txt";
    const response = await fetch(url);
    const data = await response.text();

    if (response.status !== 200) throw new Error();

    callback({ classes: data.split("\n") });
  } catch {
    callback({ classes: [] });
  }
};

/**
 * @async
 * @description Retrieves a domains list
 * @param {void} [callback]
 * @returns {Promise<{ domains: string[] }>}
 */

const getDomains = async (callback) => {
  try {
    const url =
      "https://raw.githubusercontent.com/wanhose/cookie-dialog-monster/master/data/domains.txt";
    const response = await fetch(url);
    const data = await response.text();

    if (response.status !== 200) throw new Error();

    callback({ domains: data.split("\n") });
  } catch {
    callback({ domains: [] });
  }
};

/**
 * @async
 * @description Retrieves a selectors list
 * @param {void} [callback]
 * @returns {Promise<{ classes: string[] }>}
 */

const getFixes = async (callback) => {
  try {
    const url =
      "https://raw.githubusercontent.com/wanhose/cookie-dialog-monster/master/data/fixes.txt";
    const response = await fetch(url);
    const data = await response.text();

    if (response.status !== 200) throw new Error();

    callback({ fixes: data.split("\n") });
  } catch {
    callback({ fixes: [] });
  }
};

/**
 * @async
 * @description Retrieves a selectors list
 * @param {void} [callback]
 * @returns {Promise<{ selectors: string }>}
 */

const getSelectors = async (callback) => {
  try {
    const url =
      "https://raw.githubusercontent.com/wanhose/cookie-dialog-monster/master/data/elements.txt";
    const response = await fetch(url);
    const data = await response.text();

    if (response.status !== 200) throw new Error();

    callback({ selectors: data.split("\n") });
  } catch {
    callback({ selectors: [] });
  }
};

/**
 * @description Retrieves current tab information
 * @param {void} [callback]
 * @returns {Promise<{ id: string, location: string }>}
 */

const getTab = (callback) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    callback({
      id: tabs[0].id,
      hostname: new URL(tabs[0].url).hostname,
    });
  });
};

/**
 * @description Reports active tab URL
 */

const report = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const userAgent = window.navigator.userAgent;
    const version = chrome.runtime.getManifest().version;

    if (tab) {
      fetch("https://cdm-report-service.herokuapp.com/rest/v1/report/", {
        body: JSON.stringify({
          text: `There's a problem with ${tab.url} using ${userAgent} in CDM ${version}`,
          to: "wanhose.development@gmail.com",
          subject: "Cookie Dialog Monster Report",
        }),
        headers: {
          "Content-type": "application/json",
        },
        method: "POST",
      });
    }
  });
};

/**
 * @description Update cache state
 * @param {string} [hostname]
 * @param {object} [state]
 */

const updateCache = (hostname, state) => {
  chrome.storage.local.get(null, (cache) => {
    const current = cache[hostname];

    chrome.storage.local.set({
      [hostname]: {
        enabled: typeof state.enabled === "undefined" ? current.enabled : state.enabled,
      },
    });
  });
};

/**
 * @description Listens to messages
 */

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  const hostname = request.hostname;
  const state = request.state;
  const tabId = sender.tab?.id;

  switch (request.type) {
    case "DISABLE_ICON":
      if (tabId) disableIcon(tabId);
      break;
    case "DISABLE_POPUP":
      if (tabId) disablePopup(tabId);
      break;
    case "ENABLE_ICON":
      if (tabId) enableIcon(tabId);
      break;
    case "ENABLE_POPUP":
      if (tabId) enablePopup(tabId);
      break;
    case "GET_CACHE":
      getCache(hostname, callback);
      break;
    case "GET_CLASSES":
      getClasses(callback);
      break;
    case "GET_DOMAINS":
      getDomains(callback);
      break;
    case "GET_FIXES":
      getFixes(callback);
      break;
    case "GET_SELECTORS":
      getSelectors(callback);
      break;
    case "GET_TAB":
      getTab(callback);
      break;
    case "UPDATE_CACHE":
      updateCache(hostname, state);
      break;
    default:
      break;
  }

  return true;
});

/**
 * @description Creates context menu
 */

chrome.contextMenus.create({
  contexts: ["all"],
  id: contextMenuId,
  title: chrome.i18n.getMessage("contextMenuText"),
});

/**
 * @description Listens to context menus
 */

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== contextMenuId) return;
  report();
});
