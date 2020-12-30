if (!!window.chrome) {
  const currentUrl = document.location.hostname;

  (async () => {
    const observer = new MutationObserver((mutations, observer) => {
      mutations.forEach(async () => {
        observer.disconnect();
        await remove();
        observe();
      });
    });

    const observe = () => {
      observer.observe(document.body, {
        attributes: true,
        childList: true,
      });
    };

    const remove = async () => {
      const filtersUrl = chrome.runtime.getURL("filters/index.txt");
      const text = await fetch(filtersUrl).then((res) => res.text());
      const filters = text.split("\n");

      filters.forEach((match) => {
        const element = document.querySelector(match);

        if (
          element &&
          element.tagName !== "BODY" &&
          element.tagName !== "HTML"
        ) {
          element.remove();
        }
      });
    };

    await remove();
    observe();
  })();
}
