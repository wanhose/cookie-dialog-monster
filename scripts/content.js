/**
 * @description Array of selectors
 * @type {string[]}
 */

let classes = [];

/**
 * @description Shortcut to send messages to background script
 * @type {void}
 */

const dispatch = chrome.runtime.sendMessage;

/**
 * @description Options provided to observer
 */

const options = { childList: true, subtree: true };

/**
 * @description Selectors list
 * @type {string}
 */

let selectors = "";

/**
 * @description Target provided to observer
 */

const target = document.body || document.documentElement;

/**
 * @description Fixes scroll issues
 */

const fix = () => {
  const body = document.body;
  const facebook = document.getElementsByClassName("_31e")[0];
  const html = document.documentElement;

  if (body && classes.length > 0) body.classList.remove(...classes);
  if (body) body.style.setProperty("overflow-y", "unset", "important");
  if (facebook) facebook.style.setProperty("position", "unset", "important");
  if (html) html.style.setProperty("overflow-y", "unset", "important");
};

const observer = new MutationObserver((mutations, instance) => {
  instance.disconnect();
  fix();

  for (let i = mutations.length; i--; ) {
    const mutation = mutations[i];

    for (let j = mutation.addedNodes.length; j--; ) {
      const node = mutation.addedNodes[j];

      if (!(node instanceof HTMLElement)) continue;

      if (node.matches(selectors)) node.outerHTML = "";
    }
  }

  instance.observe(target, options);
});

/**
 * @description Setups classes selectors
 * @returns {Promise<{ classes: string[] }>}
 */

const setupClasses = () =>
  new Promise((resolve) => {
    dispatch({ type: "GET_CLASSES" }, null, resolve);
  });

/**
 * @description Setups elements selectors
 * @returns {Promise<{ selectors: string }>}
 */

const setupSelectors = () =>
  new Promise((resolve) => {
    dispatch({ type: "GET_SELECTORS" }, null, resolve);
  });

/**
 * @description Setups everything and starts to observe if enabled
 */

dispatch(
  { hostname: document.location.hostname, type: "GET_CACHE" },
  null,
  async ({ enabled }) => {
    dispatch({ type: "ENABLE_POPUP" });

    if (enabled) {
      dispatch({ type: "ENABLE_ICON" });
      const results = await Promise.all([setupClasses(), setupSelectors()]);
      classes = results[0].classes;
      selectors = results[1].selectors;
      observer.observe(target, options);
    }
  }
);
