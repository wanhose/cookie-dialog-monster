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
 * @function handlePowerChange
 * @description Disables or enables extension on current page
 */

const handlePowerChange = async () => {
  chrome.runtime.sendMessage({ type: "GET_TAB" }, null, ({ hostname, id }) => {
    chrome.runtime.sendMessage(
      { hostname, type: "GET_CACHE" },
      null,
      ({ enabled }) => {
        const power = document.getElementById("power");

        chrome.runtime.sendMessage({
          hostname,
          state: { enabled: !enabled },
          type: "UPDATE_CACHE",
        });
        chrome.runtime.sendMessage({
          type: !enabled === true ? "ENABLE_ICON" : "DISABLE_ICON",
        });
        if (!enabled === false) power.removeAttribute("checked");
        if (!enabled === true) power.setAttribute("checked", "checked");
        chrome.tabs.reload(id, { bypassCache: true });
      }
    );
  });
};

/**
 * @async
 * @function handleReload
 * @description Reload current page
 */

const handleReload = async () => {
  chrome.runtime.sendMessage({ type: "GET_TAB" }, null, ({ id }) => {
    chrome.tabs.reload(id, { bypassCache: true });
  });
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
  chrome.runtime.sendMessage({ type: "GET_TAB" }, null, ({ hostname, id }) => {
    chrome.runtime.sendMessage(
      { hostname, type: "GET_CACHE" },
      null,
      ({ enabled }) => {
        const host = document.getElementById("host");
        const like = document.getElementById("like");
        const power = document.getElementById("power");
        const reload = document.getElementById("reload");
        const store = document.getElementById("store");
        const unlike = document.getElementById("unlike");

        like.addEventListener("click", handleRate);
        power.addEventListener("change", handlePowerChange);
        reload.addEventListener("click", handleReload);
        store.setAttribute("href", isChromium ? chromeUrl : firefoxUrl);
        unlike.addEventListener("click", handleRate);
        if (location) host.innerText = hostname.replace("www.", "");
        if (!enabled) power.removeAttribute("checked");
      }
    );
  });
};

/**
 * @description Listen to document ready
 *
 * @type {Document}
 * @listens document#ready
 */

document.addEventListener("DOMContentLoaded", handleContentLoaded);
