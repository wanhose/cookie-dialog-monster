/**
 * @description Array of selectors
 * @type {string[]}
 */

const classes = [];

/**
 * @description Shortcut to send messages to background script
 * @type {void}
 */

const dispatch = chrome.runtime.sendMessage;

/**
 * @description Array of domains to skip
 * @type {string[]}
 */

const domains = [];

/**
 * @description Array of instructions
 * @type {string[]}
 */

const fixes = [];

/**
 * @description Hostname
 */

const hostname = document.location.hostname;

/**
 * @description Is consent preview page?
 */

const preview = hostname.startsWith("consent.") || hostname.startsWith("myprivacy.");

/**
 * @description Options provided to observer
 */

const options = { childList: true, subtree: true };

/**
 * @description Selectors list
 * @type {string[]}
 */

const selectors = [];

/**
 * @description Target provided to observer
 */

const target = document.body || document.documentElement;

/**
 * @description Checks if node element is removable
 * @param {NodeList} node
 * @returns {boolean}
 */

const check = (node) =>
  node instanceof Element &&
  node.parentElement &&
  !["BODY", "HTML"].includes(node.tagName) &&
  !(node.id && ["APP", "ROOT"].includes(node.id.toUpperCase?.())) &&
  node.matches(selectors);

/**
 * @description Cleans DOM
 * @param {NodeList[]} nodes
 * @returns {void}
 */

const clean = (nodes) => nodes.filter(check).forEach((node) => (node.outerHTML = ""));

/**
 * @description Fixes scroll issues
 */

const fix = () => {
  for (const item of [document.body, document.documentElement]) {
    if (domains.length && !domains.includes(hostname)) {
      item?.classList.remove(...classes);
      item?.style.setProperty("position", "initial", "important");
      item?.style.setProperty("overflow-y", "initial", "important");
    }
  }

  for (const fix of fixes) {
    const [match, selector, action, property] = fix.split("##");

    if (hostname.includes(match)) {
      switch (action) {
        case "click": {
          const node = document.querySelector(selector);
          node?.click();
        }
        case "remove": {
          const node = document.querySelector(selector);
          node?.style?.removeProperty(property);
        }
        case "reset": {
          const node = document.querySelector(selector);
          node?.style?.setProperty(property, "initial", "important");
        }
        case "resetAll": {
          const nodes = document.querySelectorAll(selector);
          nodes.forEach((node) => node?.style?.setProperty(property, "initial", "important"));
        }
        default:
          break;
      }
    }
  }
};

/**
 * @description Mutation Observer instance
 * @type {MutationObserver}
 */

const observer = new MutationObserver((mutations, instance) => {
  const nodes = mutations.map((mutation) => mutation.addedNodes).flat(1);

  instance.disconnect();
  fix();
  if (!preview) clean(nodes);
  instance.observe(target, options);
});

/**
 * @description Gets data
 * @returns {Promise<any[]>}
 */

const promiseAll = () =>
  Promise.all([
    new Promise((resolve) => dispatch({ type: "GET_CLASSES" }, null, resolve)),
    new Promise((resolve) => dispatch({ type: "GET_DOMAINS" }, null, resolve)),
    new Promise((resolve) => dispatch({ type: "GET_FIXES" }, null, resolve)),
    new Promise((resolve) => dispatch({ type: "GET_SELECTORS" }, null, resolve)),
  ]);
/**
 * @description Cleans DOM again after all
 * @listens document#pageshow
 */

document.addEventListener("pageshow", () => {
  dispatch({ hostname, type: "GET_CACHE" }, null, async ({ enabled }) => {
    if (enabled) {
      const nodes = target.querySelectorAll(selectors);

      fix();
      if (!preview) clean(nodes);
      setTimeout(() => clean(nodes), 2000);
    }
  });
});

/**
 * @description Fix bfcache issues
 * @listens window#unload
 */

window.addEventListener("unload", () => {});

/**
 * @description Setups everything and starts to observe if enabled
 */

dispatch({ hostname, type: "GET_CACHE" }, null, async ({ enabled }) => {
  dispatch({ type: "ENABLE_POPUP" });

  if (enabled) {
    const results = await promiseAll();

    classes.push(...(results[0]?.classes ?? []));
    domains.push(...(results[1]?.domains ?? []));
    fixes.push(...(results[2]?.fixes ?? []));
    selectors.push(...(results[3]?.selectors ?? []));
    observer.observe(target, options);
    dispatch({ type: "ENABLE_ICON" });
  }
});
