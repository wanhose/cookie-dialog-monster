/**
 * @var attempts
 * @description Number of attempts
 * @type {number}
 */

let attempts = 1;

/**
 * @var enabled
 * @description Is extension enabled?
 * @type {boolean}
 */

let enabled = true;

/**
 * @var selectors
 * @description Array of selectors
 * @type {string[]}
 */

let selectors = [];

/**
 * @constant url
 * @description Database link
 * @type {string}
 */

const url =
  "https://raw.githubusercontent.com/wanhose/do-not-consent/master/data/elements.txt";

/**
 * @function commit
 * @description Commits selector to cache
 * @param {string} selector
 */

const commit = (selector) => {
  chrome.storage.local.get(null, (cache) => {
    const current = cache[document.location.hostname];

    chrome.storage.local.set({
      [document.location.hostname]: {
        ...current,
        matches: [...new Set([...cache.matches, selector])],
      },
    });
  });
};

/**
 * @function fix
 * @description Fix scroll issues
 */

const fix = () => {
  const html = document.documentElement;
  const body = document.body;

  html.style.setProperty("overflow-y", "unset", "important");
  body.style.setProperty("overflow-y", "unset", "important");
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
 * @async
 * @function check
 * @description Checks if extension is enabled
 * @returns {Promise<boolean>}
 */

const check = () =>
  new Promise((resolve) => {
    chrome.storage.local.get(null, (store) => {
      try {
        const cache = store[document.location.hostname];

        resolve(cache.enabled);
      } catch {
        chrome.storage.local.set(
          {
            [document.location.hostname]: {
              enabled: true,
              matches: [],
            },
          },
          () => resolve(true)
        );
      }
    });
  });

/**
 * @function removeFromCache
 * @description Removes matched elements from cache results
 */

const removeFromCache = () => {
  chrome.storage.local.get(null, (store) => {
    const cache = store[document.location.hostname];
    const matches = cache.matches;

    if (!!matches.length) {
      for (let i = matches.length; i--; ) {
        const selector = selectors[i];
        const element = search(selector);

        if (element) {
          const tagName = element.tagName.toUpperCase();

          if (!["BODY", "HTML"].includes(tagName)) {
            element.remove();
          }
        }
      }
    }
  });
};

/**
 * @function removeFromNetwork
 * @description Removes matched elements from network results
 */

const removeFromNetwork = () => {
  for (let i = selectors.length; i--; ) {
    const selector = selectors[i];
    const element = search(selector);

    if (element) {
      const tagName = element.tagName.toUpperCase();

      if (!["BODY", "HTML"].includes(tagName)) {
        element.remove();
        commit(selector);
      }
    }
  }
};

/**
 * @async
 * @function query
 * @description Retrieves selectors list
 *
 * @returns {Promise<string[]>} A selectors list
 */

const query = async () => {
  try {
    const response = await fetch(url);
    const data = await response.text();

    if (response.status !== 200) throw new Error();

    return data.split("\n");
  } catch {
    return [];
  }
};

/**
 * @constant observer
 * @description Observer instance
 * @type {MutationObserver}
 */

const observer = new MutationObserver((_, instance) => {
  instance.disconnect();
  fix();
  removeFromCache();
  if (attempts <= 5) removeFromNetwork();
  attempts += 1;
  observe();
});

/**
 * @function observe
 * @description Starts observing document.body element
 */

const observe = () => {
  observer.observe(document.body, {
    attributes: true,
    childList: true,
  });
};

/**
 * @async
 * @function handleContentLoaded
 * @description Cleans, fixes scroll issues and observes document.body element
 */

const handleContentLoaded = async () => {
  chrome.runtime.sendMessage({ type: "ENABLE_POPUP" });
  enabled = await check();

  if (enabled) {
    chrome.runtime.sendMessage({ type: "ENABLE_ICON" });
    selectors = await query();

    if (selectors.length > 0) {
      fix();
      removeFromCache();
      removeFromNetwork();
      observe();
    }
  }
};

/**
 * @description Listen to document ready
 *
 * @type {Document}
 * @listens document#ready
 */

document.addEventListener("DOMContentLoaded", handleContentLoaded);
