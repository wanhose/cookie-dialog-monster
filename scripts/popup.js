/**
 * @constant chromeUrl
 * @description Chrome Web Store link
 * @type {string}
 */

const chromeUrl =
  "https://chrome.google.com/webstore/detail/djcbfpkdhdkaflcigibkbpboflaplabg";

/**
 * @constant dispatch
 * @description Shortcut to send messages to background script
 * @type {void}
 */

const dispatch = chrome.runtime.sendMessage;

/**
 * @constant firefoxUrl
 * @description Firefox Add-ons link
 * @type {string}
 */

const firefoxUrl =
  "https://addons.mozilla.org/es/firefox/addon/cookie-dialog-monster/";

/**
 * @constant isChromium
 * @description Is current browser an instance of Chromium?
 * @type {boolean}
 */

const isChromium = chrome.runtime.getURL("").startsWith("chrome-extension://");

/**
 * @description Disables or enables extension on current page
 */

const handlePowerChange = () => {
  dispatch({ type: "GET_TAB" }, null, ({ hostname, id }) => {
    dispatch({ hostname, type: "GET_CACHE" }, null, ({ enabled }) => {
      const power = document.getElementById("power");

      dispatch({
        hostname,
        state: { enabled: !enabled },
        type: "UPDATE_CACHE",
      });
      dispatch({
        type: !enabled === true ? "ENABLE_ICON" : "DISABLE_ICON",
      });
      if (!enabled === false) power.removeAttribute("checked");
      if (!enabled === true) power.setAttribute("checked", "checked");
      chrome.tabs.reload(id, { bypassCache: true });
    });
  });
};

/**
 * @description Reload current page
 */

const handleReload = () => {
  dispatch({ type: "GET_TAB" }, null, ({ id }) => {
    chrome.tabs.reload(id, { bypassCache: true });
  });
};

/**
 * @description Shows negative or positive messages
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
 * @description Setup stars handlers and result message links
 */

const handleContentLoaded = () => {
  dispatch({ type: "GET_TAB" }, null, ({ hostname }) => {
    dispatch({ hostname, type: "GET_CACHE" }, null, ({ enabled }) => {
      translate();

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
    });
  });
};

/**
 * @description Applies translations to tags with i18n data attribute
 */

const translate = () => {
  const nodes = document.querySelectorAll("[data-i18n]");

  for (let i = nodes.length; i--; ) {
    const node = nodes[i];
    const { i18n } = node.dataset;

    node.innerHTML = chrome.i18n.getMessage(i18n);
  }
};

/**
 * @description Listen to document ready
 * @listens document#ready
 */

document.addEventListener("DOMContentLoaded", handleContentLoaded);
