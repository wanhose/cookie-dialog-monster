if (typeof chrome.app.isInstalled !== 'undefined') {
  // Observer
  const observer = new MutationObserver((mutations, observer) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        observer.disconnect();
        doMagic();
        observe();
      }
    });
  });

  // Remover
  const doMagic = () => {
    const notRemovableElements = Array.from([
      // Quantcast
      ...document.getElementsByClassName("qc-cmp-ui-showing"),
    ]);

    const removableElements = Array.from([
      // ENS
      document.getElementById("ensNotifyBanner"),
      // Quantcast
      ...document.getElementsByClassName("qc-cmp-ui-container"),
      // OneTrust
      document.getElementById("onetrust-consent-sdk"),
      // Optanon
      ...document.getElementsByClassName("optanon-alert-box-wrapper"),
    ]);

    notRemovableElements.forEach(element => {
      // Quantcast
      element.classList.remove("qc-cmp-ui-showing");
    });
    
    removableElements.forEach(element => !!element && element.remove());
  };

  // Observer starts observe when call this function
  const observe = () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      //...
    });
  };

  // Then...
  doMagic();
  observe();
}