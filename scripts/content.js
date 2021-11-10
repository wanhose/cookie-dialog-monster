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
 * @description Array of instructions
 * @type {string[]}
 */

let fixes = [];

/**
 * @description Hostname
 */

const hostname = document.location.hostname;

/**
 * @description Is consent preview page?
 */

const isPreview = hostname.startsWith("consent.");

/**
 * @description Options provided to observer
 */

const options = { attributes: true, childList: true, subtree: true };

/**
 * @description Selectors list
 * @type {string[]}
 */

let selectors = [];

/**
 * @description Target provided to observer
 */

const target = document.body || document.documentElement;

/**
 * @description Checks if node element is removable
 * @param {Element} node
 */

const check = (node) =>
  node instanceof HTMLElement &&
  node.parentElement &&
  !["BODY", "HTML"].includes(node.tagName) &&
  !(node.id && ["APP", "ROOT"].includes(node.id.toUpperCase()));

/**
 * @description Cleans DOM
 */

const clean = () => {
  if (selectors.length) {
    const nodes = document.querySelectorAll(selectors);

    nodes.forEach((node) => {
      const valid = check(node);

      if (valid) node.outerHTML = "";
    });
  }
};

/**
 * @description Fixes scroll issues
 */

const fix = () => {
  const body = document.body;
  const frame = !(window === window.parent || window.opener);
  const html = document.documentElement;

  if (body && html) {
    body.classList.remove(...classes);
    html.classList.remove(...classes);

    if (!frame) {
      body.style.setProperty("position", "initial", "important");
      body.style.setProperty("overflow-y", "initial", "important");
      html.style.setProperty("position", "initial", "important");
      html.style.setProperty("overflow-y", "initial", "important");
    }
  }

  fixes.forEach((fix) => {
    const [match, selector, action, property] = fix.split("##");

    if (hostname.includes(match)) {
      switch (action) {
        case "click":
          const submit = document.querySelector(selector);

          if (submit && submit instanceof HTMLElement) {
            submit.click();
          }
          break;
        case "reset":
          const node = document.querySelector(selector);

          if (node && node instanceof HTMLElement) {
            node.style.setProperty(property, "initial", "important");
          }
          break;
        case "resetAll":
          const nodes = document.querySelectorAll(selector);

          nodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              node.style.setProperty(property, "initial", "important");
            }
          });
          break;
        default:
          break;
      }
    }
  });
};

const observer = new MutationObserver((mutations, instance) => {
  instance.disconnect();
  fix();

  if (!isPreview) {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        const valid = check(node);

        if (valid && node.matches(selectors)) node.outerHTML = "";
      });
    });
  }

  instance.observe(target, options);
});

/**
 * @description Queries classes selectors
 * @returns {Promise<{ classes: string[] }>}
 */

const queryClasses = () =>
  new Promise((resolve) => {
    dispatch({ type: "GET_CLASSES" }, null, resolve);
  });

/**
 * @description Queries fixes instructions
 * @returns {Promise<{ fixes: string[] }>}
 */

const queryFixes = () =>
  new Promise((resolve) => {
    dispatch({ type: "GET_FIXES" }, null, resolve);
  });

/**
 * @description Queries elements selectors
 * @returns {Promise<{ selectors: string }>}
 */

const querySelectors = () =>
  new Promise((resolve) => {
    dispatch({ type: "GET_SELECTORS" }, null, resolve);
  });

/**
 * @description Listens DOM complete state
 * @listens document#readystatechange
 */

document.addEventListener("readystatechange", () => {
  dispatch({ hostname, type: "GET_CACHE" }, null, async ({ enabled }) => {
    if (document.readyState === "complete" && enabled && !isPreview) {
      fix();
      clean();
      setTimeout(clean, 2000);
    }
  });
});

/**
 * @description Setups everything and starts to observe if enabled
 */

dispatch({ hostname, type: "GET_CACHE" }, null, async ({ enabled }) => {
  dispatch({ type: "ENABLE_POPUP" });

  if (enabled) {
    dispatch({ type: "ENABLE_ICON" });
    const results = await Promise.all([
      queryClasses(),
      queryFixes(),
      querySelectors(),
    ]);
    classes = results[0].classes;
    fixes = results[1].fixes;
    selectors = results[2].selectors;
    observer.observe(target, options);
  }
});
