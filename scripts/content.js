/**
 * @description Number of attempts
 * @type {number}
 */

let attempts = 1;

/**
 * @description Array of selectors
 * @type {string[]}
 */

let classesFromNetwork = [];

/**
 * @description Shortcut to send messages to background script
 * @type {void}
 */

const dispatch = chrome.runtime.sendMessage;

/**
 * @description Array of selectors
 * @type {string[]}
 */

let selectorsFromCache = [];

/**
 * @description Array of selectors
 * @type {Promise<string[]>[]}
 */

let selectorsFromNetwork = [];

/**
 * @description Split large arrays into promises
 * @param {string[]} array
 */

const chunkerize = (array) =>
  [...Array(Math.ceil(array.length / 300))].map(
    (_, index) => () =>
      new Promise((resolve) => {
        removeElements(array.slice(index * 300, (index + 1) * 300), true);
        resolve(true);
      })
  );

/**
 * @description Fixes scroll issues
 */

const fix = () => {
  const body = document.body;
  const classes = classesFromNetwork;
  const facebook = document.getElementsByClassName("_31e")[0];
  const html = document.documentElement;

  if (body && classes.length > 0) body.classList.remove(...classes);
  if (body) body.style.setProperty("overflow-y", "unset", "important");
  if (facebook) facebook.style.setProperty("position", "unset", "important");
  if (html) html.style.setProperty("overflow-y", "unset", "important");
};

/**
 * @function removeElements
 * @description Removes matched elements from a selectors array
 * @param {string[]} selectors
 * @param {boolean} updateCache
 */

const removeElements = (selectors, updateCache) => {
  for (let i = selectors.length; i--; ) {
    const selector = selectors[i];
    const element = search(selector);

    if (element) {
      const tagName = element.tagName.toUpperCase();

      if (!["BODY", "HTML"].includes(tagName)) {
        element.remove();

        if (updateCache) {
          selectorsFromCache = [...selectorsFromCache, selector];
          dispatch({
            hostname: document.location.hostname,
            state: { matches: [selector] },
            type: "UPDATE_CACHE",
          });
        }
      }
    }
  }
};

/**
 * @function runTasks
 * @description Starts running tasks
 */

const runTasks = async () => {
  if (attempts <= 20) {
    fix();
    removeElements(selectorsFromCache);

    if (selectorsFromNetwork.length > 0) {
      const selectors = selectorsFromNetwork;

      if (attempts <= 5) await Promise.all(selectors.map((fn) => fn()));
      if (document.readyState === "complete") attempts += 1;
    }
  }
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
 * @description Setups classes selectors
 * @type {Promise<boolean>}
 */

const setupClasses = new Promise((resolve) => {
  dispatch({ type: "GET_CLASSES" }, null, ({ classes }) => {
    classesFromNetwork = classes;
    resolve(true);
  });
});

/**
 * @description Setups elements selectors
 * @type {Promise<boolean>}
 */

const setupSelectors = new Promise((resolve) => {
  dispatch({ type: "GET_SELECTORS" }, null, ({ selectors }) => {
    selectorsFromNetwork = chunkerize(selectors);
    resolve(true);
  });
});

dispatch(
  { hostname: document.location.hostname, type: "GET_CACHE" },
  null,
  async ({ enabled, matches }) => {
    dispatch({ type: "ENABLE_POPUP" });

    if (enabled) {
      selectorsFromCache = matches;
      dispatch({ type: "ENABLE_ICON" });
      await Promise.all([setupClasses, setupSelectors]);
      setInterval(runTasks, 500);
    }
  }
);
