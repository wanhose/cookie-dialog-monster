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

  const remove = async () => {
    const filtersUrl = chrome.runtime.getURL("filters/index.txt");
    const text = await fetch(filtersUrl).then((res) => res.text());
    const filters = text.split("\n");

    filters.forEach((match) => {
      const element = document.querySelector(match);

      if (element && element.tagName !== "BODY" && element.tagName !== "HTML") {
        element.remove();
      }
    });
  };

  (async () => {
    fix();
    await remove();
    observe();
  })();
}
