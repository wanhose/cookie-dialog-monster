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
 * @description Hostname
 */

const hostname = document.location.hostname;

/**
 * @description Is consent preview page?
 */

const isConsentPreview = hostname.startsWith("consent.");

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
 * @description Cleans DOM
 */

const clean = () => {
  if (selectors.length) {
    const results = document.querySelectorAll(selectors);

    for (let i = results.length; i--; ) results[i].outerHTML = "";
  }
};

/**
 * @description Fixes scroll issues
 */

const fix = () => {
  const automobiel = /automobielmanagement.nl/g.test(hostname);
  const body = document.body;
  const facebook = document.getElementsByClassName("_31e")[0];
  const google = document.querySelector('form[action*="consent.google"]');
  const html = document.documentElement;
  const play = hostname.startsWith("play.google.");
  const yahoo = document.querySelector("#consent-page");

  if (automobiel && body) {
    for (let i = body.childNodes.length; i--; ) {
      const node = body.childNodes[i];
      if (node instanceof HTMLElement)
        node.style.setProperty("filter", "initial", "important");
    }
  }

  if (body) {
    if (classes.length) body.classList.remove(...classes);
    body.style.setProperty("overflow-y", "initial", "important");
    body.style.setProperty("position", "initial", "important");
  }

  if (facebook) {
    facebook.style.setProperty("position", "initial", "important");
  }

  if (google) {
    const submit = google.querySelector("button");
    if (submit) submit.click();
  }

  if (html) {
    if (classes.length) html.classList.remove(...classes);
    html.style.setProperty("position", "initial", "important");
    html.style.setProperty("overflow-y", "initial", "important");
  }

  if (play) {
    const element = document.querySelector("body > div");
    if (element) element.style.setProperty("z-index", "initial", "important");
  }

  if (yahoo) {
    const submit = yahoo.querySelector('button[type="submit"]');
    if (submit) submit.click();
  }
};

const observer = new MutationObserver((mutations, instance) => {
  instance.disconnect();
  fix();

  if (!isConsentPreview) {
    for (let i = mutations.length; i--; ) {
      const mutation = mutations[i];

      for (let j = mutation.addedNodes.length; j--; ) {
        const node = mutation.addedNodes[j];
        const valid =
          node instanceof HTMLElement &&
          node.parentElement &&
          !["BODY", "HTML"].includes(node.tagName);

        if (!valid) continue;

        if (node.matches(selectors)) node.outerHTML = "";
      }
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
 * @description Listens DOM complete state
 */

document.addEventListener("readystatechange", () => {
  if (document.readyState === "complete") {
    fix();

    if (!isConsentPreview) {
      clean();
      setTimeout(clean, 2000);
    }
  }
});

/**
 * @description Setups everything and starts to observe if enabled
 */

dispatch({ hostname, type: "GET_CACHE" }, null, async ({ enabled }) => {
  dispatch({ type: "ENABLE_POPUP" });

  if (enabled) {
    dispatch({ type: "ENABLE_ICON" });
    const results = await Promise.all([setupClasses(), setupSelectors()]);
    classes = results[0].classes;
    selectors = results[1].selectors;
    observer.observe(target, options);
  }
});
