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
      // PLO
      ...document.getElementsByClassName("plu-no-scroll"),
      // Quantcast
      ...document.getElementsByClassName("qc-cmp-ui-showing"),
      // Miscellaneous
      ...document.getElementsByClassName("_2LLC6zrbk-vsnF0seit6vi"),
      ...document.getElementsByClassName("gdpr"),
    ]);

    const removableElements = Array.from([
      // BLQ
      document.getElementById("blq-global"),
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
      document.getElementById("cmpContainer"),
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
      // eni.com
      document.getElementById("eni-cookie-banner"),
      // ENS
      document.getElementById("ensNotifyBanner"),
      // ePrivacy
      document.getElementById("ePrivacyDisclaimer"),
      // Facebook
      ...document.getElementsByClassName("fbPageBanner"),
      // Google
      document.getElementById("cookie-statement"),
      // HS
      document.getElementById("hs-eu-cookie-confirmation"),
      // iubenda
      document.getElementById("iubenda-cs-banner"),
      ...document.getElementsByClassName("iubenda-cs-bottom"),
      ...document.getElementsByClassName("iubenda-cs-container"),
      ...document.getElementsByClassName("iubenda-cs-default"),
      // Moove
      document.getElementById("moove_gdpr_cookie_info_bar"),
      // NHS
      document.getElementById("nhsuk-cookie-banner"),
      // OneTrust
      document.getElementById("onetrust-consent-sdk"),
      // Optanon
      ...document.getElementsByClassName("optanon-alert-box-wrapper"),
      // PLO
      ...document.getElementsByClassName("plo-cookie-overlay"),
      ...document.getElementsByClassName("plo-overlay"),
      // Quantcast
      ...document.getElementsByClassName("qc-cmp-ui-container"),
      // Termly
      document.getElementById("consent"),
      // Wordpress
      document.getElementById("catapult-cookie-bar"),
      // Miscellaneous
      ...document.getElementsByClassName("_1ouSF3xnwUjIOquxopuxSZ"),
      ...document.getElementsByClassName("announcements"),
      ...document.getElementsByClassName("cc-cookies"),
      document.getElementById("cconsent-bar"),
      document.getElementById("cookie-consent-banner"),
      document.getElementById("cookie-div"),
      document.getElementById("cookie-law-info-bar"),
      document.getElementById("cookie-law-info-again"),
      document.getElementById("cookie-notice"),
      ...document.getElementsByClassName("cookie-permission"),
      document.getElementById("cookie-policy"),
      document.getElementById("cookie-policy-consent"),
      document.getElementById("cookie1"),
      ...document.getElementsByClassName("cookiebar"),
      document.getElementById("cookieLayer"),
      document.getElementById("cookieNotice"),
      document.getElementById("cookieNotificationBannerWrapper"),
      ...document.getElementsByClassName("cookies-notice"),
      ...document.getElementsByClassName("cookies"),
      ...document.getElementsByClassName("cookiesms"),
      document.getElementById("cp-dialog"),
      document.getElementById("cp-overlay"),
      ...document.getElementsByClassName("fot-fixd"),
      document.getElementById("global-cookie-message"),
      ...document.getElementsByClassName("grp-header__cookiedisclaimer"),
      ...document.getElementsByClassName("js-cookies"),
      document.getElementById("js-gdpr-consent-banner"),
      ...document.getElementsByClassName("pam"),
      document.getElementById("sd-cmp"),
      ...document.getElementsByClassName("security-policy"),
      document.getElementById("sliding-popup"),
      document.getElementById("softMessages-list"),
      ...document.getElementsByClassName("softMessages-list"),
      document.getElementById("u_0_1"),
    ]);

    notRemovableElements.forEach(element => {
      // PLO
      element.classList.remove("plu-no-scroll");
      // Quantcast
      element.classList.remove("qc-cmp-ui-showing");
      // Miscellaneous
      element.classList.remove("_2LLC6zrbk-vsnF0seit6vi");
      element.classList.remove("gdpr");
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