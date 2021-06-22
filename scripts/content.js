/**
 * @var attempts
 * @description Number of attempts
 * @type {number}
 */

let attempts = 1;

/**
 * @var intervalId
 * @description Task interval identifier
 * @type {number}
 */

let intervalId = 0;

/**
 * @var ready
 * @description Is extension ready?
 * @type {boolean}
 */

let ready = false;

/**
 * @var selectorsFromCache
 * @description Array of selectors
 * @type {string[]}
 */

let selectorsFromCache = [];

/**
 * @var selectorsFromNetwork
 * @description Array of selectors
 * @type {string[]}
 */

let selectorsFromNetwork = [];

/**
 * @function fix
 * @description Fix scroll issues
 */

const fix = () => {
  const html = document.documentElement;
  const body = document.body;
  const facebook = document.getElementsByClassName("._31e")[0];

  if (body) body.style.setProperty("overflow-y", "unset", "important");
  if (facebook) facebook.style.setProperty("position", "unset", "important");
  if (html) html.style.setProperty("overflow-y", "unset", "important");
  if (ready) html.style.setProperty("opacity", "1", "important");
};

/**
 * @function search
 * @description Retrieves HTML element if selector exists
 *
 * @param {string} selector
 * @returns {HTMLElement | null} An HTML element or null
 */

const search = (selector) => {
  if (!selector.includes("[") && !selector.includes(">")) {
    if (selector.startsWith(".")) {
      return document.getElementsByClassName(selector.slice(1))[0];
    }

    if (selector.startsWith("#")) {
      return document.getElementById(selector.slice(1));
    }
  } else {
    return document.querySelector(selector);
  }

  return null;
};

/**
 * @function removeFromCache
 * @description Removes matched elements from cache results
 */

const removeFromCache = () => {
  for (let i = selectorsFromCache.length; i--; ) {
    const selector = selectorsFromCache[i];
    const element = search(selector);

    if (element) {
      const tagName = element.tagName.toUpperCase();

      if (!["BODY", "HTML"].includes(tagName)) {
        element.remove();
        ready = true;
      }
    }
  }
};

/**
 * @function removeFromNetwork
 * @description Removes matched elements from network results
 */

const removeFromNetwork = () => {
  for (let i = selectorsFromNetwork.length; i--; ) {
    const selector = selectorsFromNetwork[i];
    const element = search(selector);

    if (element) {
      const tagName = element.tagName.toUpperCase();

      if (!["BODY", "HTML"].includes(tagName)) {
        element.remove();
        ready = true;
        chrome.runtime.sendMessage({
          hostname: document.location.hostname,
          selector,
          type: "UPDATE_CACHE",
        });
      }
    }
  }
};

/**
 * @function runTasks
 * @description Starts running tasks
 */

const runTasks = () => {
  if (attempts >= 5 || selectorsFromCache.length === 0) ready = true;

  if (attempts <= 20) {
    fix();
    removeFromCache();
    if (attempts <= 5) removeFromNetwork();
    attempts += 1;
  }

  if (attempts > 20) {
    clearInterval(intervalId);
  }
};

/**
 * @description Setup extension context
 */

chrome.runtime.sendMessage(
  { hostname: document.location.hostname, type: "GET_CACHE" },
  null,
  async (cacheResponse) => {
    console.log(cacheResponse);
    chrome.runtime.sendMessage({ type: "ENABLE_POPUP" });

    if (cacheResponse.enabled) {
      selectorsFromCache = cacheResponse.matches;
      chrome.runtime.sendMessage({ type: "ENABLE_ICON" });
      chrome.runtime.sendMessage(
        { type: "GET_LIST" },
        null,
        async (networkResponse) => {
          selectorsFromNetwork = networkResponse.matches;
          intervalId = setInterval(runTasks, 500);
        }
      );
    } else {
      document.documentElement.style.setProperty("opacity", "1", "important");
    }
  }
);
