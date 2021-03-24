let attempts = 0;
let filters = [];

const fix = () => {
  const body = document.body.style;
  const html = document.documentElement.style;

  body.setProperty("overflow-y", "unset", "important");
  html.setProperty("overflow-y", "unset", "important");
};

const retrieveElement = (match) => {
  if (!match.includes("[") && !match.includes(">")) {
    if (match.startsWith(".")) {
      return document.getElementsByClassName(match.slice(1))[0];
    }

    if (match.startsWith("#")) {
      return document.getElementById(match.slice(1));
    }
  } else {
    return document.querySelector(match);
  }

  return null;
};

const observe = () => {
  observer.observe(document.body, {
    attributes: true,
    childList: true,
  });
};

const removeFromCache = () => {
  chrome.storage.local.get([document.location.hostname], (value) => {
    const matches = value[document.location.hostname];

    if (matches && !!matches.length) {
      for (let i = 0; i < matches.length; i++) {
        const element = retrieveElement(matches[i]);
        const tagName = element ? element.tagName.toUpperCase() : "";

        if (element && !["BODY", "HTML"].includes(tagName)) {
          element.remove();
        }
      }
    }
  });
};

const updateCache = (value) => {
  chrome.storage.local.get([document.location.hostname], (store) => {
    const matches = store[document.location.hostname];

    chrome.storage.local.set({
      [document.location.hostname]: matches
        ? [...new Set([...matches, value])]
        : [value],
    });
  });
};

const removeFromFilters = () => {
  if (attempts < 5) {
    for (let i = 0; i < filters.length; i++) {
      const match = filters[i];
      const element = retrieveElement(match);
      const tagName = element ? element.tagName.toUpperCase() : "";

      if (element && !["BODY", "HTML"].includes(tagName)) {
        updateCache(match);
        element.remove();
      }
    }
  }
};

const observer = new MutationObserver((mutations, observer) => {
  mutations.forEach(() => {
    observer.disconnect();
    fix();
    removeFromCache();
    removeFromFilters();
    attempts += 1;
    observe();
  });
});

(async () => {
  const url = chrome.runtime.getURL("filters/index.txt");
  const db = await fetch(url).then((res) => res.text());
  filters = db.split("\n");

  fix();
  removeFromCache();
  removeFromFilters();
  observe();
})();
