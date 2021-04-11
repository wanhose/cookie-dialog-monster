/**
 * @constant chromeUrl
 * @description Chrome Web Store link
 * @type {string}
 */

const chromeUrl =
  "https://chrome.google.com/webstore/detail/do-not-consent/djcbfpkdhdkaflcigibkbpboflaplabg";

/**
 * @constant firefoxUrl
 * @description Firefox Add-ons link
 * @type {string}
 */

const firefoxUrl =
  "https://addons.mozilla.org/es/firefox/addon/do-not-consent/";

/**
 * @constant isChromium
 * @description Is current browser an instance of Chromium?
 * @type {boolean}
 */

const isChromium = chrome.runtime.getURL("").startsWith("chrome-extension://");

/**
 * @async
 * @function currentTab
 * @description Returns current tab state
 *
 * @returns {Promise<{ id: string, location: URL }>}
 */

const currentTab = () =>
  new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve({
        id: tabs[0].id,
        location: new URL(tabs[0].url),
      });
    });
  });

/**
 * @async
 * @function currentState
 * @description Returns current extension state
 *
 * @returns {Promise<{ enabled: boolean, matches: string[] }>}>}
 */

const currentState = async () => {
  const tab = await currentTab();

  return new Promise((resolve) => {
    chrome.storage.local.get(null, (store) => {
      resolve(store[tab.location.hostname]);
    });
  });
};

/**
 * @async
 * @function handlePowerChange
 * @description Disables or enables extension on current page
 */

const handlePowerChange = async () => {
  const state = await currentState();
  const tab = await currentTab();

  chrome.storage.local.set(
    {
      [tab.location.hostname]: {
        ...state,
        enabled: !state.enabled,
      },
    },
    () => {
      const power = document.getElementById("power");

      if (!state.enabled === true) {
        power.setAttribute("checked", "checked");
        chrome.runtime.sendMessage({ type: "ENABLE_ICON" });
      } else {
        power.removeAttribute("checked");
        chrome.runtime.sendMessage({ type: "DISABLE_ICON" });
      }

      chrome.tabs.reload(tab.id, { bypassCache: true });
    }
  );
};

/**
 * @async
 * @function handleReload
 * @description Reload current page
 */

const handleReload = async () => {
  const tab = await currentTab();

  chrome.tabs.reload(tab.id, { bypassCache: true });
};

/**
 * @function handleRate
 * @description Shows negative or positive messages
 *
 * @param {MouseEvent} event
 */

const handleRate = (event) => {
  const negative = document.getElementById("negative");
  const positive = document.getElementById("positive");

  switch (event.currentTarget.id) {
    case "unlike":
      positive.setAttribute("hidden", "true");
      negative.removeAttribute("hidden");
      break;
    case "like":
      negative.setAttribute("hidden", "true");
      positive.removeAttribute("hidden");
      break;
    default:
      break;
  }
};

/**
 * @async
 * @function handleContentLoaded
 * @description Setup stars handlers and result message links
 */

const handleContentLoaded = async () => {
  const host = document.getElementById("host");
  const like = document.getElementById("like");
  const power = document.getElementById("power");
  const reload = document.getElementById("reload");
  const state = await currentState();
  const store = document.getElementById("store");
  const tab = await currentTab();
  const unlike = document.getElementById("unlike");

  like.addEventListener("click", handleRate);
  power.addEventListener("change", handlePowerChange);
  reload.addEventListener("click", handleReload);
  store.setAttribute("href", isChromium ? chromeUrl : firefoxUrl);
  unlike.addEventListener("click", handleRate);

  if (tab.location) host.innerText = tab.location.hostname.replace("www.", "");
  if (state.enabled) power.setAttribute("checked", "checked");
};

/**
 * @description Listen to document ready
 *
 * @type {Document}
 * @listens document#ready
 */

document.addEventListener("DOMContentLoaded", handleContentLoaded);
