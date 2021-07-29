/**
 * @var attempts
 * @description Number of attempts
 * @type {number}
 */

let attempts = 1;

/**
 * @constant dispatch
 * @description Shortcut to send messages to background script
 * @type {void}
 */

const dispatch = chrome.runtime.sendMessage;

/**
 * @var intervalId
 * @description Task interval identifier
 * @type {number}
 */

let intervalId = 0;

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
  const body = document.body;
  const classListToRemove = ["ta-cc-modal-open"];
  const facebook = document.getElementsByClassName("_31e")[0];
  const html = document.documentElement;

  if (body) body.classList.remove(...classListToRemove);
  if (body) body.style.setProperty("overflow-y", "unset", "important");
  if (facebook) facebook.style.setProperty("position", "unset", "important");
  if (html) html.style.setProperty("overflow-y", "unset", "important");
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

      if (!["BODY", "HTML"].includes(tagName)) element.remove();
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
        dispatch({
          hostname: document.location.hostname,
          state: { matches: [selector] },
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
  if (attempts <= 20) {
    fix();
    removeFromCache();
    if (attempts <= 5) removeFromNetwork();
    if (document.readyState === "complete") attempts += 1;
  }

  if (attempts > 20) {
    clearInterval(intervalId);
  }
};

/**
 * @description Setup extension context
 */

dispatch(
  { hostname: document.location.hostname, type: "GET_CACHE" },
  null,
  ({ enabled, matches }) => {
    dispatch({ type: "ENABLE_POPUP" });

    if (enabled) {
      selectorsFromCache = matches;
      dispatch({ type: "ENABLE_ICON" });
      dispatch({ type: "GET_LIST" }, null, ({ selectors }) => {
        selectorsFromNetwork = selectors;
        intervalId = setInterval(runTasks, 500);
      });
    }
  }
);
