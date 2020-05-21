export const getNotRemovableElements = (document) => Array.from([
    // Didomi
    ...document.getElementsByClassName("didomi-popup-open"),
    // PLO
    ...document.getElementsByClassName("plu-no-scroll"),
    // Quantcast
    ...document.getElementsByClassName("qc-cmp-ui-showing"),
    // Miscellaneous
    ...document.getElementsByClassName("_2LLC6zrbk-vsnF0seit6vi"),
    ...document.getElementsByClassName("gdpr"),
    ...document.getElementsByClassName("noScroll"),
]);

export const getRemovableElements = (document) => Array.from([
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
    // Clym
    ...document.getElementsByClassName("clym-widget"),
    document.getElementById("clym-widget-privacy-frame"),
    // Consent Management Provider
    document.getElementById("cmpbox"),
    document.getElementById("cmpbox2"),
    document.getElementById("cmpContainer"),
    // Cookie-Script
    document.getElementById("cookiescript_injected"),
    // cookieBAR
    document.getElementById("cookie-bar"),
    document.getElementById("cookie-bar-prompt"),
    // Cookie Information
    document.getElementById("coiOverlay"),
    // crowdy.ai
    document.getElementById("crowdy-flyout"),
    document.getElementById("crowdy-privacy-snippet"),
    document.getElementById("crowdy-privacy-widget"),
    document.getElementById("crowdy-privacy-widget-background"),
    // Cybot
    ...document.getElementsByClassName("CybotCookiebotDialog"),
    ...document.getElementsByName("CybotCookiebotDialog"),
    document.getElementById("CybotCookiebotDialog"),
    // Didomi
    document.getElementById("didomi-host"),
    document.getElementById("didomi-notice"),
    document.getElementById("didomi-popup"),
    // eni.com
    document.getElementById("eni-cookie-banner"),
    // ENS
    document.getElementById("ensNotifyBanner"),
    // ePrivacy
    document.getElementById("eprivacyCookie"),
    document.getElementById("ePrivacyDisclaimer"),
    // Evidon
    document.getElementById("_evidon_banner"),
    ...document.getElementsByClassName("evidon-banner"),
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
    document.getElementById("optanon"),
    ...document.getElementsByClassName("optanon-alert-box-wrapper"),
    // PLO
    ...document.getElementsByClassName("plo-cookie-overlay"),
    ...document.getElementsByClassName("plo-overlay"),
    // Quantcast
    ...document.getElementsByClassName("qc-cmp-ui-container"),
    // Seers
    document.getElementById("seers-cx-banner"),
    // Termly
    document.getElementById("consent"),
    // Twitter
    ...document.getElementsByClassName("css-1dbjc4n r-aqfbo4 r-1p0dtai r-1d2f490 r-12vffkv r-1xcajam r-zchlnj"),
    // UniConsent
    document.getElementById("uniccmp"),
    // Wordpress
    document.getElementById("catapult-cookie-bar"),
    // Miscellaneous
    ...document.getElementsByClassName("_1ouSF3xnwUjIOquxopuxSZ"),
    ...document.getElementsByClassName("announcements"),
    ...document.getElementsByClassName("app_gdpr--3hGmb"),
    document.getElementById("barraaceptacion"),
    ...document.getElementsByClassName("branch-journeys-top"),
    document.getElementById("cajacookies"),
    ...document.getElementsByClassName("cc-cookies"),
    document.getElementById("cconsent-bar"),
    ...document.getElementsByClassName("cookie-consent"),
    ...document.getElementsByClassName("cookiedisclaimer"),
    ...document.getElementsByClassName("cookie_box"),
    document.getElementById("cookie-consent-banner"),
    ...document.getElementsByClassName("cookie-container"),
    document.getElementById("cookie-div"),
    document.getElementById("cookie-law-info-bar"),
    document.getElementById("cookie-law-info-again"),
    ...document.getElementsByClassName("cookie-message"),
    ...document.getElementsByClassName("cookie-message-top"),
    ...document.getElementsByClassName("cookie-notice"),
    document.getElementById("cookie-notice"),
    ...document.getElementsByClassName("cookie-permission"),
    document.getElementById("cookie-policy"),
    document.getElementById("cookie-policy-consent"),
    document.getElementById("cookie-settings"),
    document.getElementById("cookies-use-alert"),
    document.getElementById("cookie1"),
    document.getElementById("cookieBar"),
    ...document.getElementsByClassName("cookiebar"),
    document.getElementById("cookieLayer"),
    document.getElementById("cookieMessage"),
    document.getElementById("cookieMessageWrapper"),
    document.getElementById("cookieNotice"),
    document.getElementById("cookieNotificationBannerWrapper"),
    document.getElementById("cookiePlaceholder"),
    ...document.getElementsByClassName("cookies-notice"),
    ...document.getElementsByClassName("cookies"),
    ...document.getElementsByClassName("cookies-alert"),
    ...document.getElementsByClassName("cookiesms"),
    document.getElementById("cp-dialog"),
    document.getElementById("cp-overlay"),
    ...document.getElementsByClassName("dimmed"),
    document.getElementById("eu-cookie-law"),
    document.getElementById("gdpr-banner"),
    ...document.getElementsByClassName("fot-fixd"),
    document.getElementById("global-cookie-message"),
    ...document.getElementsByClassName("grp-header__cookiedisclaimer"),
    document.getElementById("iFrame1"),
    ...document.getElementsByClassName("js-cookie-consent"),
    ...document.getElementsByClassName("js-cookies"),
    document.getElementById("js-gdpr-consent-banner"),
    ...document.getElementsByClassName("m-privacy-consent"),
    ...document.getElementsByClassName("modal-backdrop"),
    document.getElementById("modal-consent"),
    ...document.getElementsByClassName("mw-cookiewarning-container"),
    ...document.getElementsByClassName("pam"),
    document.getElementById("privacy-consent"),
    document.getElementById("scms-cc-cookie-bar"),
    ...document.getElementsByClassName("scms-cookie-control"),
    document.getElementById("sd-cmp"),
    ...document.getElementsByClassName("security-policy"),
    document.getElementById("sliding-popup"),
    document.getElementById("sncmp-container"),
    document.getElementById("softMessages-list"),
    ...document.getElementsByClassName("softMessages-list"),
    document.getElementById("u_0_1"),
    document.getElementById("widget_eu_cookie_law_widget"),
]);