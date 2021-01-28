if (!!window.chrome) {
  let attempts = 0;
  let filters = [];
  const options = {
    attributes: true,
    childList: true,
  };

  const fix = () => {
    document.body.style = "overflow-y: unset !important;";
  };

  const retrieveElement = (match) => {
    if (!match.includes("[") && !match.includes(">")) {
      if (match[0] === ".") {
        return document.getElementsByClassName(match.slice(1))[0];
      }

      if (match[0] === "#") {
        return document.getElementById(match.slice(1));
      }
    } else {
      return document.querySelector(match);
    }

    return null;
  };

  const removeFromCache = () => {
    chrome.storage.local.get([document.location.hostname], (value) => {
      const matches = value[document.location.hostname];

      if (matches && !!matches.length) {
        matches.forEach((match) => {
          const element = retrieveElement(match);
          const tagName = element ? element.tagName.toUpperCase() : "";

          if (element && !["BODY", "HTML"].includes(tagName)) {
            element.remove();
          }
        });
      }
    });
  };

  const updateCache = (value) => {
    chrome.storage.local.get([document.location.hostname], (store) => {
      const matches = store[document.location.hostname];

      if (!!matches) {
        if (!matches.includes(value)) {
          chrome.storage.local.set({
            [document.location.hostname]: [...new Set([...matches, value])],
          });
        }
      } else {
        chrome.storage.local.set({
          [document.location.hostname]: [value],
        });
      }
    });
  };

  const removeFromFilters = () => {
    if (attempts < 3) {
      filters.forEach((match) => {
        const element = retrieveElement(match);
        const tagName = element ? element.tagName.toUpperCase() : "";

        if (element && !["BODY", "HTML"].includes(tagName)) {
          updateCache(match);
          element.remove();
        }
      });
    }
  };

  const observer = new MutationObserver((mutations, observer) => {
    mutations.forEach(() => {
      observer.disconnect();
      fix();
      removeFromCache();
      removeFromFilters();
      attempts += 1;
      observer.observe(document.body, options);
    });
  });

  const observe = () => {
    observer.observe(document.body, options);
  };

  (async () => {
    const url = chrome.runtime.getURL("filters/index.txt");
    const db = await fetch(url).then((res) => res.text());
    filters = db.split("\n");

    fix();
    removeFromCache();
    removeFromFilters();
    observe();
  })();
}
