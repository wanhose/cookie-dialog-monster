if (typeof chrome.app.isInstalled !== 'undefined') {
    // Observer
    const observer = new MutationObserver((mutations, observer) => {
      for (let mutation of mutations) {
        if (mutation.type === 'childList') {
          observer.disconnect();
          doMagic();
          observe();
        }
      }
    });
  
    // Inject buttons
    const doMagic = () => {
        const notRemovableElements = Array.from(document.getElementsByClassName("qc-cmp-ui-showing"));
        notRemovableElements.forEach(element => {
            element.classList.remove("qc-cmp-ui-showing");
        });
        
        const removableElements = Array.from(document.getElementsByClassName("qc-cmp-ui-container"));
        removableElements.forEach(element => {
            element.remove();
        });
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