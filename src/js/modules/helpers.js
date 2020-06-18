export const getNotRemovableElements = (document) => Array.from([
    // Didomi
    ...document.getElementsByClassName('didomi-popup-open'),
    // Mazda
    document.querySelector('[class^="mxp-main-desktop-navigation"],[class*=" mxp-main-desktop-navigation"]'),
    document.querySelector('[class^="mxp-main-mobile-navigation"],[class*=" mxp-main-mobile-navigation"]'),
    // PLO
    ...document.getElementsByClassName('plu-no-scroll'),
    // Quantcast
    ...document.getElementsByClassName('qc-cmp-ui-showing'),
    // Miscellaneous
    ...document.getElementsByClassName('_2LLC6zrbk-vsnF0seit6vi'),
    ...document.getElementsByClassName('cartMergeOnHomePage_page'),
    ...document.getElementsByClassName('clearfix fade'),
    ...document.getElementsByClassName('cli-barmodal-open'),
    ...document.getElementsByClassName('cookiesAccepted'),
    ...document.getElementsByClassName('cookiewall-active'),
    ...document.getElementsByClassName('gdpr'),
    ...document.getElementsByClassName('header'),
    document.getElementById('header'),
    ...document.getElementsByClassName('no-cookies'),
    ...document.getElementsByClassName('noScroll'),
]);

export const getRemovableElements = (document) => Array.from([
    // AZA
    document.querySelector('aza-cookie-message'),
    // BLQ
    document.getElementById('blq-global'),
    // CC
    ...document.getElementsByClassName('cc_banner'),
    ...document.getElementsByClassName('cc_container'),
    ...document.getElementsByClassName('cc-banner'),
    document.getElementById('cc-banner-wrap'),
    ...document.getElementsByClassName('cc-bottom'),
    ...document.getElementsByClassName('cc-cookie-consent-banner-modal'),
    document.getElementById('cc-cookie-law'),
    ...document.getElementsByClassName('cc-theme-block'),
    ...document.getElementsByClassName('cc-type-info'),
    ...document.getElementsByClassName('cc-window'),
    // Civic
    document.getElementById('ccc'),
    document.getElementById('ccc-notify'),
    document.getElementById('ccc-overlay'),
    // CKY
    document.getElementById('cky-consent'),
    ...document.getElementsByClassName('cky-consent-bar'),
    // Clym
    ...document.getElementsByClassName('clym-widget'),
    document.getElementById('clym-widget-privacy-frame'),
    // Consent Management Provider
    document.getElementById('cmpbox'),
    document.getElementById('cmpbox2'),
    document.getElementById('cmpContainer'),
    // Cookie-Script
    document.getElementById('cookiescript_injected'),
    // cookieBAR
    document.getElementById('cookie-bar'),
    document.getElementById('cookie-bar-prompt'),
    // Cookie Information
    document.getElementById('coiOverlay'),
    // crowdy.ai
    document.getElementById('crowdy-flyout'),
    document.getElementById('crowdy-privacy-snippet'),
    document.getElementById('crowdy-privacy-widget'),
    document.getElementById('crowdy-privacy-widget-background'),
    // Cybot
    ...document.getElementsByClassName('CybotCookiebotDialog'),
    ...document.getElementsByName('CybotCookiebotDialog'),
    document.getElementById('CybotCookiebotDialog'),
    document.getElementById('CybotCookiebotDialogBodyUnderlay'),
    // Didomi
    document.getElementById('didomi-host'),
    document.getElementById('didomi-notice'),
    document.getElementById('didomi-popup'),
    // eni.com
    document.getElementById('eni-cookie-banner'),
    // ENS
    document.getElementById('ensNotifyBanner'),
    // ePrivacy
    document.getElementById('eprivacyCookie'),
    document.getElementById('ePrivacyDisclaimer'),
    // Evidon
    document.getElementById('_evidon_banner'),
    document.getElementById('_evidon-barrier-wrapper'),
    ...document.getElementsByClassName('evidon-banner'),
    // Facebook
    ...document.getElementsByClassName('fbPageBanner'),
    // Google
    document.getElementById('cookie-statement'),
    // HS
    document.getElementById('hs-eu-cookie-confirmation'),
    // ibeu
    ...document.getElementsByClassName('ibeugdpr-banner'),
    ...document.getElementsByClassName('ibeugdpr-overlay'),
    // iubenda
    document.getElementById('iubenda-cs-banner'),
    ...document.getElementsByClassName('iubenda-cs-bottom'),
    ...document.getElementsByClassName('iubenda-cs-container'),
    ...document.getElementsByClassName('iubenda-cs-default'),
    // Lerum
    document.getElementById('lerumCookieContainer'),
    // Lindex
    ...document.getElementsByClassName('lindex-cookie-bar'),
    // Moove
    document.getElementById('moove_gdpr_cookie_info_bar'),
    // NHS
    document.getElementById('nhsuk-cookie-banner'),
    // OneTrust
    document.getElementById('onetrust-consent-sdk'),
    // Optanon
    document.querySelector('[describedby="alert-box-message"]'),
    document.getElementById('optanon'),
    ...document.getElementsByClassName('optanon-alert-box-wrapper'),
    // PLO
    ...document.getElementsByClassName('plo-cookie-overlay'),
    ...document.getElementsByClassName('plo-overlay'),
    // PUM
    ...document.getElementsByClassName('popmake-overlay'),
    ...document.getElementsByClassName('pum'),
    ...document.getElementsByClassName('pum-active'),
    ...document.getElementsByClassName('pum-overlay'),
    // Quantcast
    ...document.getElementsByClassName('qc-cmp-ui-container'),
    ...document.getElementsByClassName('qc-cmp2-container'),
    // Seers
    document.getElementById('seers-cx-banner'),
    // Termly
    document.getElementById('consent'),
    // Twitter
    ...document.getElementsByClassName('css-1dbjc4n r-aqfbo4 r-1p0dtai r-1d2f490 r-12vffkv r-1xcajam r-zchlnj'),
    // UniConsent
    document.getElementById('uniccmp'),
    // Wordpress
    document.getElementById('catapult-cookie-bar'),
    ...document.getElementsByClassName('wordpress-gdpr-popup'),
    document.getElementById('wp-top'),
    ...document.getElementsByClassName('wppopups-whole'),
    // Miscellaneous
    document.getElementById('__ic-notice'),
    document.getElementById('__tealiumGDPRecModal'),
    ...document.getElementsByClassName('_1ouSF3xnwUjIOquxopuxSZ'),
    document.getElementById('_evh-ric'),
    document.getElementById('_iph_cp_popup'),
    document.getElementById('_psaihm_main_div'),
    document.getElementById('_psaihm_overlay'),
    document.getElementById('about-cookies'),
    ...document.getElementsByClassName('ad-banner-container'),
    document.getElementById('AdBillboard'),
    document.getElementById('ac'),
    document.getElementById('ac-Banner'),
    document.getElementById('acc-alert'),
    document.getElementById('accept-cookies'),
    document.getElementById('accept-cookies-div'),
    document.getElementById('acceptcookies'),
    ...document.getElementsByClassName('adroll_consent_banner'),
    document.getElementById('adroll_consent_banner'),
    ...document.getElementsByClassName('alert--cookie'),
    ...document.getElementsByClassName('alert-cookies'),
    ...document.getElementsByClassName('alertbar alertbar-bottom jsEnabled'),
    document.getElementById('air_cookielaw_container'),
    ...document.getElementsByClassName('alma-data-policy-banner'),
    document.getElementById('alma-data-policy-banner'),
    ...document.getElementsByClassName('announcements'),
    document.querySelector('[class^="app_gdpr"],[class*=" app_gdpr"]'),
    ...document.getElementsByClassName('argpd-cookies'),
    document.getElementById('au_cookiesalert'),
    ...document.getElementsByClassName('bankid-cookie'),
    document.getElementById('banner-cookie'),
    document.getElementById('banner-cookies'),
    ...document.getElementsByClassName('banner cookies-banner'),
    document.getElementById('banner-spacer'),
    ...document.getElementsByClassName('BannerPrivacyInformation'),
    document.getElementById('barraaceptacion'),
    ...document.getElementsByClassName('blockdisclaimer'),
    document.getElementById('blockdisclaimer'),
    document.getElementById('bonaCookies'),
    ...document.getElementsByClassName('branch-journeys-top'),
    ...document.getElementsByClassName('c notifier is-bottom-fixed'),
    ...document.getElementsByClassName('c-cookie-bar'),
    ...document.getElementsByClassName('c-cookie-policy'),
    ...document.getElementsByClassName('c-cookies'),
    ...document.getElementsByClassName('c-message'),
    ...document.getElementsByClassName('c-policy'),
    ...document.getElementsByClassName('caja_cookies'),
    document.getElementById('cajacookies'),
    document.getElementById('capa-cookies'),
    document.getElementById('cb-cookieoverlay'),
    document.getElementById('cboxOverlay'),
    document.getElementById('cboxWrapper'),
    ...document.getElementsByClassName('cc-cookies'),
    document.getElementById('cconsent-bar'),
    document.getElementById('cmp-faktor-io-parent'),
    document.getElementById('cl_modal'),
    ...document.getElementsByClassName('cli-modal-backdrop'),
    document.getElementById('cNag'),
    document.getElementById('cnil_bar_wrapper'),
    document.querySelector('cnv-cookies-banner'),
    ...document.getElementsByClassName('codecontent'),
    ...document.getElementsByClassName('coi-consent-banner'),
    document.getElementById('coiConsentBanner'),
    ...document.getElementsByClassName('consent-banner'),
    document.getElementById('consent_blackbar'),
    document.getElementById('container-cookie'),
    document.getElementById('container-screen'),
    ...document.getElementsByClassName('cookie'),
    document.getElementById('cookie'),
    ...document.getElementsByClassName('cookie__modal'),
    ...document.getElementsByClassName('cookie__wrapper'),
    document.getElementById('cookie_assistant'),
    ...document.getElementsByClassName('cookie_bar'),
    ...document.getElementsByClassName('cookie_box'),
    document.getElementById('cookie_box'),
    ...document.getElementsByClassName('cookie_header'),
    ...document.getElementsByClassName('cookie_message'),
    ...document.getElementsByClassName('cookie_message_box'),
    ...document.getElementsByClassName('cookie-alert'),
    ...document.getElementsByClassName('cookie-banner'),
    document.getElementById('cookie-banner'),
    ...document.getElementsByClassName('cookie-banner-content'),
    ...document.getElementsByClassName('cookie-bar'),
    ...document.getElementsByClassName('cookie-block'),
    ...document.getElementsByClassName('cookie-box'),
    ...document.getElementsByClassName('cookie-collapsible'),
    ...document.getElementsByClassName('cookie-consent'),
    document.getElementById('cookie-consent'),
    document.getElementById('cookie-consent-banner'),
    ...document.getElementsByClassName('cookie-consent-wrapper'),
    ...document.getElementsByClassName('cookie-container'),
    ...document.getElementsByClassName('cookie-dialogue'),
    ...document.getElementsByClassName('cookie-disclaimer'),
    document.getElementById('cookie-div'),
    document.getElementById('cookie-hint'),
    document.getElementById('cookie-holder'),
    ...document.getElementsByClassName('cookie-info'),
    document.getElementById('cookie-info'),
    ...document.getElementsByClassName('cookie-info-container'),
    ...document.getElementsByClassName('cookie-info-panel'),
    document.getElementById('cookie-info-wrapper'),
    ...document.getElementsByClassName('cookie-information'),
    ...document.getElementsByClassName('cookie-informer'),
    document.getElementById('cookie-law-info-again'),
    document.getElementById('cookie-law-info-bar'),
    ...document.getElementsByClassName('cookie-layer-visible'),
    ...document.getElementsByClassName('cookie-message'),
    document.getElementById('cookie-message'),
    ...document.getElementsByClassName('cookie-message-top'),
    document.getElementById('cookie-msg'),
    ...document.getElementsByClassName('cookie-note'),
    ...document.getElementsByClassName('cookie-notice'),
    document.getElementById('cookie-notice'),
    ...document.getElementsByClassName('cookie-notification'),
    ...document.getElementsByClassName('cookie-permission'),
    ...document.getElementsByClassName('cookie-policy'),
    document.getElementById('cookie-policy'),
    ...document.getElementsByClassName('cookie-policy-alert'),
    document.getElementById('cookie-policy-consent'),
    ...document.getElementsByClassName('cookie-policy-container'),
    ...document.getElementsByClassName('cookie-policy-form'),
    document.getElementById('cookie-policy-strap'),
    ...document.getElementsByClassName('cookie-popup'),
    document.getElementById('cookie-popup'),
    ...document.getElementsByClassName('cookie-prompter'),
    ...document.getElementsByClassName('cookie-section'),
    document.getElementById('cookie-settings'),
    ...document.getElementsByClassName('cookie-text-third'),
    document.getElementById('cookie-ue'),
    document.getElementById('cookie-warning-container'),
    ...document.getElementsByClassName('cookie-warning'),
    document.getElementById('cookie-warning'),
    ...document.getElementsByClassName('cookie-wrap'),
    document.getElementById('cookie1'),
    document.getElementById('cookieAccept'),
    document.getElementById('cookieAcceptContainer'),
    document.getElementById('cookieAcknowledgement'),
    ...document.getElementsByClassName('cookieAsker'),
    ...document.getElementsByClassName('cookiealert'),
    ...document.getElementsByClassName('cookieBanner'),
    document.getElementById('cookieBanner'),
    document.getElementById('cookiebar'),
    document.getElementById('cookieBar'),
    ...document.getElementsByClassName('cookiebar'),
    ...document.getElementsByClassName('cookiebox'),
    document.getElementById('cookiebox'),
    document.getElementById('cookieChoiceInfo'),
    document.getElementById('cookieCompliance'),
    document.getElementById('cookieConsentModal'),
    ...document.getElementsByClassName('cookieContainer'),
    ...document.getElementsByClassName('cookieDialog'),
    ...document.getElementsByClassName('cookiedisclaimer'),
    document.getElementById('cookieForm'),
    ...document.getElementsByClassName('cookiesInfo'),
    document.getElementById('cookieLayer'),
    document.getElementById('cookielawwarning'),
    ...document.getElementsByClassName('cookielegal'),
    document.getElementById('cookieMessage'),
    document.getElementById('cookiemessage-root'),
    document.getElementById('cookieMessageWrapper'),
    ...document.getElementsByClassName('cookieMSG'),
    document.getElementById('cookieNote'),
    document.getElementById('cookieNotice'),
    document.getElementById('cookienotif'),
    document.getElementById('cookieNotificationBannerWrapper'),
    document.getElementById('cookienotify-wrapper'),
    document.getElementById('cookiePlaceholder'),
    ...document.getElementsByClassName('cookiePolicy'),
    document.getElementById('cookiePolicy'),
    document.getElementById('Cookiebanner'),
    document.getElementById('Cookieinfo'),
    ...document.getElementsByClassName('CookieNotice'),
    document.getElementById('CookieReportsBanner'),
    document.getElementById('Cookievarning'),
    ...document.getElementsByClassName('CookieWarning'),
    ...document.getElementsByClassName('cookies'),
    document.getElementById('cookies'),
    document.getElementById('cookies_cont'),
    ...document.getElementsByClassName('cookies__content'),
    ...document.getElementsByClassName('cookies__consent'),
    ...document.getElementsByClassName('cookies__info'),
    ...document.getElementsByClassName('cookies__layover'),
    ...document.getElementsByClassName('cookies__wrapper'),
    ...document.getElementsByClassName('cookies-alert'),
    document.getElementById('cookies_alert'),
    ...document.getElementsByClassName('cookies-accept-message'),
    ...document.getElementsByClassName('cookies-bar'),
    document.getElementById('cookies-consentimiento'),
    document.getElementById('cookies-info-banner'),
    ...document.getElementsByClassName('cookies-infostyled__Container-ajf3yz-0'),
    ...document.getElementsByClassName('cookies-notice'),
    document.getElementById('cookies-use-alert'),
    document.querySelector('[class^="CookiesBanner__FixedContainer"],[class*=" CookiesBanner__FixedContainer"]'),
    ...document.getElementsByClassName('cookiesbar'),
    document.getElementById('cookiesInfo'),
    document.getElementById('Cookieskript'),
    document.getElementById('CookiesSkript'),
    ...document.getElementsByClassName('cookiesms'),
    document.getElementById('cookpoly'),
    document.getElementById('cp-dialog'),
    document.getElementById('cp-overlay'),
    ...document.getElementsByClassName('cp_cookie-dialog'),
    ...document.getElementsByClassName('cp_dialog'),
    document.getElementById('ctl11_CookiePanel'),
    document.querySelector('[data-assembly-source="cookie/banner"]'),
    document.querySelector('[data-component-name="cookieNotification"]'),
    document.querySelector('[data-component-type="cookiePanel"]'),
    document.querySelector('[data-cookie-container]'),
    document.querySelector('[data-cookiename]'),
    document.querySelector('[data-dismissable-id="cookieinfo"]'),
    document.querySelector('[data-etsy-promo-banner]'),
    document.querySelector('[data-gdpr-consent-prompt]'),
    document.querySelector('[data-gdpr-consent-prompt-open-automatically]'),
    document.querySelector('[data-gdpr-single-choice-overlay]'),
    document.querySelector('[data-id="cookie-policy"]'),
    document.querySelector('[data-id="infobar"]'),
    document.querySelector('[data-js="cookie-policy"]'),
    document.querySelector('[data-label="hirdetés"]')
        ? document.querySelector('[data-label="hirdetés"]').parentElement
        : null,
    document.querySelector('[data-qa="oil-Layer"]'),
    document.querySelector('[data-type="cookie-modal"]'),
    document.querySelector('[data-ui-test="pm-cookie-banner"]'),
    document.querySelector('[data-user-confirmation-screen-holder]'),
    document.querySelector('[data-view="components/header"]'),
    document.querySelector('[data-wgt="remarketing-banner"]'),
    document.querySelector('[data-widget="cookie-dialog"]'),
    ...document.getElementsByClassName('dimmed'),
    document.getElementById('div_bar_cookies_info'),
    document.getElementById('div-gpt-ad-1534233551293-0'),
    document.getElementById('divCookie'),
    document.getElementById('eads-super-banner'),
    document.querySelector('epaas-consent-drawer-shell'),
    ...document.getElementsByClassName('eu-cookie-bar-notification'),
    document.getElementById('eu-cookie-bar-notification'),
    document.getElementById('eu-cookie-law'),
    ...document.getElementsByClassName('EUc'),
    ...document.getElementsByClassName('eupopup-container'),
    document.getElementById('ez-cookie-dialog'),
    document.getElementById('ez-cookie-dialog-wrapper'),
    document.getElementById('fn-cookies-confirmation'),
    document.getElementById('footer_tc_privacy'),
    document.getElementById('forMobileBanner'),
    ...document.getElementsByClassName('gb_Ud'),
    ...document.getElementsByClassName('gb_bd'),
    ...document.getElementsByClassName('gb_na'),
    ...document.getElementsByClassName('gdpr'),
    document.getElementById('gdpr-banner'),
    ...document.getElementsByClassName('gdpr-consent'),
    document.getElementById('gdpr-consent'),
    ...document.getElementsByClassName('gdpr-eu'),
    document.getElementById('gdprConsent'),
    document.getElementById('GDPRConsent'),
    ...document.getElementsByClassName('gel-cookie-banner'),
    document.getElementById('gel-cookie-banner'),
    ...document.getElementsByClassName('fot-fixd'),
    document.getElementById('global-cookie-message'),
    document.getElementById('golem-cookie-accept'),
    ...document.getElementsByClassName('grp-header__cookiedisclaimer'),
    ...document.getElementsByClassName('has-cookie-message'),
    ...document.getElementsByClassName('header-cookie-content'),
    ...document.getElementsByClassName('header-container__ad-container'),
    document.getElementById('headerTopTracking'),
    document.getElementById('ib-section-cookie-banner'),
    document.getElementById('iFrame1'),
    document.getElementById('informations-cookies'),
    ...document.getElementsByClassName('jetbrains-cookies-banner'),
    ...document.getElementsByClassName('js-accept-cookies-banner'),
    ...document.getElementsByClassName('js-ad-banner-container'),
    ...document.getElementsByClassName('js-alert-notice'),
    ...document.getElementsByClassName('js-banner-cookie'),
    ...document.getElementsByClassName('js-cookie-consent'),
    ...document.getElementsByClassName('js-cookie-consent-box'),
    ...document.getElementsByClassName('js-cookie-msg'),
    ...document.getElementsByClassName('js-cookie-notice'),
    ...document.getElementsByClassName('js-cookie-notification'),
    document.getElementById('js-cookie-notification'),
    document.getElementById('js-cookie-popup'),
    ...document.getElementsByClassName('js-cookies'),
    document.getElementById('js-gdpr-consent-banner'),
    ...document.getElementsByClassName('js-info-banner'),
    ...document.getElementsByClassName('js-personalInformationNotice'),
    ...document.getElementsByClassName('js-policy'),
    ...document.getElementsByClassName('js-prompt-container'),
    ...document.getElementsByClassName('l-disclaimer'),
    document.getElementById('lableca'),
    ...document.getElementsByClassName('lb-background'),
    ...document.getElementsByClassName('lb-foreground'),
    document.getElementById('lc_cookies-main'),
    ...document.getElementsByClassName('lp-cookie-consent'),
    ...document.getElementsByClassName('lp-cookie-warning'),
    ...document.getElementsByClassName('m-cookie-banner'),
    ...document.getElementsByClassName('m-privacy-consent'),
    ...document.getElementsByClassName('m1-footer-messages'),
    ...document.getElementsByClassName('mh-message-bar'),
    document.getElementById('mktg_Cookie_Wrap'),
    ...document.getElementsByClassName('mod-cookielayer'),
    ...document.getElementsByClassName('modal-backdrop'),
    document.getElementById('modal-consent'),
    document.getElementById('modal-cookie-information'),
    document.getElementById('ms_cookie_ok'),
    ...document.getElementsByClassName('ms-footer-fixbox'),
    ...document.getElementsByClassName('msg-tray'),
    ...document.getElementsByClassName('msg-tray--cookie'),
    document.getElementById('msgCookie'),
    document.getElementById('msgTray_0'),
    document.getElementById('mtr-consent'),
    ...document.getElementsByClassName('mw-cookiewarning-container'),
    document.querySelector('[class^="mxp-main-cookie-panel-container"],[class*=" mxp-main-cookie-panel-container"]'),
    ...document.getElementsByClassName('mxm-cookie-alert'),
    ...document.getElementsByClassName('no-print'),
    ...document.getElementsByClassName('notice--cookie'),
    document.getElementById('notice-cookie-block'),
    ...document.getElementsByClassName('notification--cookie'),
    ...document.getElementsByClassName('notificacion-cookies'),
    ...document.getElementsByClassName('notification-banner'),
    ...document.getElementsByClassName('notificacion-cookies'),
    ...document.getElementsByClassName('notification-LoVQsSOU'),
    ...document.getElementsByClassName('notifications-bar__info-message--cookie'),
    ...document.getElementsByClassName('nr-cookie-notification'),
    document.getElementById('ObsCnil'),
    ...document.getElementsByClassName('okookie'),
    document.getElementById('okookie-box'),
    document.querySelector('[onclick="acceptCookies()"]') 
        ? document.querySelector('[onclick="acceptCookies()"]').parentElement
        : null,
    ...document.getElementsByClassName('pageNotification'),
    ...document.getElementsByClassName('pam'),
    ...document.getElementsByClassName('parallax-billboard'),
    ...document.getElementsByClassName('pea_cook_wrapper'),
    document.getElementById('pecr-cookie-banner-wrapper'),
    document.getElementById('policy'),
    ...document.getElementsByClassName('polopolyNotification'),
    document.getElementById('popover-login'),
    document.getElementById('POPUP_CONTAINER'),
    document.querySelector('md-toast'),
    document.getElementById('privacy'),
    document.getElementById('privacy-consent'),
    document.getElementById('privacy-header'),
    document.getElementById('privacy_bandeau'),
    document.getElementById('privacy_popin'),
    document.getElementById('pronamic_cookie_holder'),
    ...document.getElementsByClassName('Root__gdprBanner___13G_T'),
    document.getElementById('rgpdbanner'),
    ...document.getElementsByClassName('rodo-popup'),
    document.querySelector('[role="alertdialog"]'),
    document.getElementById('rtveCookiePolicy'),
    ...document.getElementsByClassName('s-cookies'),
    document.getElementById('sanoma-consent-bar-mobile'),
    document.getElementById('sccm-container'),
    document.getElementById('scms-cc-cookie-bar'),
    ...document.getElementsByClassName('scms-cookie-control'),
    document.getElementById('sd-cmp'),
    ...document.getElementsByClassName('security-policy'),
    ...document.getElementsByClassName('sf-cookie-notification'),
    document.getElementById('sliding-popup'),
    ...document.getElementsByClassName('snackbar snackbar--active'),
    document.getElementById('sncmp-container'),
    document.getElementById('softMessages-list'),
    ...document.getElementsByClassName('softMessages-list'),
    ...document.getElementsByClassName('sol-cookie-banner'),
    ...document.getElementsByClassName('sol-cookie-container'),
    ...document.getElementsByClassName('sol-cookie-message'),
    document.querySelector('[id^="sp_message_container"]'),
    document.getElementById('st_box'),
    ...document.getElementsByClassName('stampenCookieContainer'),
    document.getElementById('stampenCookieInformationContainer'),
    ...document.getElementsByClassName('starttopdialog'),
    document.getElementById('storage-notice'),
    ...document.getElementsByClassName('sui-CmpUi'),
    ...document.getElementsByClassName('t3-cookie-notice'),
    document.getElementById('t3CookieNotice'),
    document.getElementById('tarteaucitronRoot'),
    document.getElementById('thp_notf_div'),
    ...document.getElementsByClassName('top-wrp bnr-wrp'),
    ...document.getElementsByClassName('topInfo'),
    ...document.getElementsByClassName('truste_box_overlay'),
    ...document.getElementsByClassName('truste_overlay'),
    document.querySelector('[type="COOKIE_USAGE"]'),
    document.getElementById('u_0_1'),
    ...document.getElementsByClassName('uix_noticeInner'),
    ...document.getElementsByClassName('uk-cookie-popup'),
    document.getElementById('ukCookiePopup'),
    document.getElementById('usercentrics-button'),
    document.getElementById('userConsent'),
    document.getElementById('vscookieAlertCont'),
    ...document.getElementsByClassName('widget_cookies'),
    document.getElementById('widget_eu_cookie_law_widget'),
    document.getElementById('wpx_cookie'),
    document.querySelector('ytd-consent-bump-renderer'),
]);
