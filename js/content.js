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
    // Quantcast
    const notRemovableElements = Array.from(document.getElementsByClassName("qc-cmp-ui-showing"));
    notRemovableElements.forEach(element => {
      element.classList.remove("qc-cmp-ui-showing");
    });
    
    const removableElements = Array.from(document.getElementsByClassName("qc-cmp-ui-container"));
    removableElements.forEach(element => {
      element.remove();
    });

    let removableElement = null;

    // ENS
    removableElement = document.getElementById("ensNotifyBanner");
    if (!!removableElement) removableElement.remove();

    // OneTrust
    removableElement = document.getElementById("onetrust-consent-sdk");
    if (!!removableElement) removableElement.remove();
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