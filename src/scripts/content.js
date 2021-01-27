if (!!window.chrome) {
  const fix = () => {
    document.body.style = "overflow-y: unset !important;";
  };

  const observe = () => {
    observer.observe(document.body, {
      attributes: true,
      childList: true,
    });
  };

  const observer = new MutationObserver((mutations, observer) => {
    mutations.forEach(async () => {
      observer.disconnect();
      fix();
      await remove();
      observe();
    });
  });

  const removeFromCache = () => {
    chrome.storage.sync.get([document.location.hostname], (value) => {
      const matches = value[document.location.hostname];

      if (matches && !!matches.length) {
        matches.forEach((match) => {
          const element = document.querySelector(match);
          const tagName = element ? element.tagName.toUpperCase() : "";

          if (element && !["BODY", "HTML"].includes(tagName)) {
            matches.push(match);
            element.remove();
          }
        });
      }
    });
  };

  const saveToCache = (value) => {
    chrome.storage.sync.set({ [document.location.hostname]: value });
  };

  const remove = async () => {
    const filtersUrl = chrome.runtime.getURL("filters/index.txt");
    const text = await fetch(filtersUrl).then((res) => res.text());
    const filters = text.split("\n");
    const matches = [];

    filters.forEach((match) => {
      const element = document.querySelector(match);
      const tagName = element ? element.tagName.toUpperCase() : "";

      if (element && !["BODY", "HTML"].includes(tagName)) {
        matches.push(match);
        element.remove();
      }
    });

    saveToCache(matches);
  };

  (async () => {
    fix();
    removeFromCache();
    await remove();
    observe();
  })();
}
