if (!!window.chrome) {
  let attempts = 0;
  const filtersUrl = chrome.runtime.getURL("filters/index.txt");
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
            matches.push(match);
            element.remove();
          }
        });
      }
    });
  };

  const updateCache = (value) => {
    chrome.storage.local.get([document.location.hostname], (store) => {
      const matches = store[document.location.hostname];

      if (matches && !!matches.length && !matches.includes(value)) {
        chrome.storage.local.set({
          [document.location.hostname]: [...new Set([...matches, value])],
        });
      } else {
        chrome.storage.local.set({
          [document.location.hostname]: [value],
        });
      }
    });
  };

  const removeFromFilters = async () => {
    if (attempts < 3) {
      const text = await fetch(filtersUrl).then((res) => res.text());
      const filters = text.split("\n");

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

  fix();
  removeFromCache();
  removeFromFilters();
  observe();
}
