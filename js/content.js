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
      // CC
      ...document.getElementsByClassName("cc-banner"),
      ...document.getElementsByClassName("cc_banner"),
      ...document.getElementsByClassName("cc-bottom"),
      ...document.getElementsByClassName("cc_container"),
      ...document.getElementsByClassName("cc-theme-block"),
      ...document.getElementsByClassName("cc-type-info"),
      ...document.getElementsByClassName("cc-window"),
      // Civic
      document.getElementById("ccc"),
      document.getElementById("ccc-notify"),
      document.getElementById("ccc-overlay"),
      // CKY
      document.getElementById('cky-consent'),
      ...document.getElementsByClassName("cky-consent-bar"),
      // Consent Management Provider
      document.getElementById("cmpbox"),
      document.getElementById("cmpbox2"),
      // Cookie-Script
      document.getElementById("cookiescript_injected"),
      // cookieBAR
      document.getElementById("cookie-bar"),
      document.getElementById("cookie-bar-prompt"),
      // crowdy.ai
      document.getElementById("crowdy-flyout"),
      document.getElementById("crowdy-privacy-snippet"),
      document.getElementById("crowdy-privacy-widget"),
      document.getElementById("crowdy-privacy-widget-background"),
      // ENS
      document.getElementById("ensNotifyBanner"),
      // Google
      document.getElementById("cookie-statement"),
      // iubenda
      document.getElementById("iubenda-cs-banner"),
      ...document.getElementsByClassName("iubenda-cs-bottom"),
      ...document.getElementsByClassName("iubenda-cs-container"),
      ...document.getElementsByClassName("iubenda-cs-default"),
      // Quantcast
      ...document.getElementsByClassName("qc-cmp-ui-container"),
      // OneTrust
      document.getElementById("onetrust-consent-sdk"),
      // Optanon
      ...document.getElementsByClassName("optanon-alert-box-wrapper"),
      // Termly
      document.getElementById("consent"),
      // Miscellaneous
      document.getElementById("cconsent-bar"),
      document.getElementById("cookie-consent-banner"),
      document.getElementById("cookie-law-info-bar"),
      document.getElementById("cookie-law-info-again"),
      document.getElementById("cookie-notice"),
      ...document.getElementsByClassName("cookies"),
      document.getElementById("cookieNotice"),
      ...document.getElementsByClassName("fot-fixd"),
      ...document.getElementsByClassName("js-cookies"),
    ]);

    notRemovableElements.forEach(element => {
      // Quantcast
      element.classList.remove("qc-cmp-ui-showing");
    });

    // Fix stucked pages
    document.body.style.overflow = '';
    document.body.style.overflowX = '';
    document.body.style.overflowY = '';
    
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