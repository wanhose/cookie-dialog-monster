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
 * @returns {Promise<Object<string, { enabled: boolean, matches: string[] }>>}>}
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
 * @function handleButtonClick
 * @description Disables or enables extension
 *
 * @param {MouseEvent} event
 */

const handleStateButtonClick = async () => {
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
      const stateButton = document.getElementById("state-button");

      stateButton.innerHTML = state.enabled
        ? "Enable extension"
        : "Disable extension";
      chrome.runtime.sendMessage({
        type: state.enabled ? "DISABLE_ICON" : "ENABLE:ICON",
      });
      chrome.tabs.reload(tab.id, { bypassCache: true });
    }
  );
};

/**
 * @function handleStarClick
 * @description Hides stars and shows negative or positive messages
 *
 * @param {MouseEvent} event
 */

const handleStarClick = (event) => {
  const negative = document.getElementById("negative");
  const positive = document.getElementById("positive");
  const { score } = event.currentTarget.dataset;
  const stars = document.getElementById("stars");

  switch (score) {
    case "1":
    case "2":
    case "3":
      stars.setAttribute("hidden", "true");
      negative.removeAttribute("hidden");
      break;
    case "4":
    case "5":
      stars.setAttribute("hidden", "true");
      positive.removeAttribute("hidden");
      break;
    default:
      break;
  }
};

/**
 * @function handleContentLoaded
 * @description Setup stars handlers and result message links
 */

const handleContentLoaded = async () => {
  const stars = Array.from(document.getElementsByClassName("star"));
  const state = await currentState();
  const stateButton = document.getElementById("state-button");
  const storeLink = document.getElementById("store-link");

  stars.forEach((star) => star.addEventListener("click", handleStarClick));
  stateButton.innerHTML = state.enabled
    ? "Disable extension"
    : "Enable extension";
  stateButton.addEventListener("click", handleStateButtonClick);
  storeLink.setAttribute("href", isChromium ? chromeUrl : firefoxUrl);
};

/**
 * @description Listen to document ready
 *
 * @type {Document}
 * @listens document#ready
 */

document.addEventListener("DOMContentLoaded", handleContentLoaded);
