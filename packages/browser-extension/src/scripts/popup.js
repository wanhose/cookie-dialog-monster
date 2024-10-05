/**
 * @typedef {Object} ExtensionState
 * @property {boolean} on
 * @property {ExtensionIssue} [issue]
 */

/**
 * @typedef {Object} PopupState
 * @extends {ExtensionState}
 * @property {number} [tabId]
 */

if (typeof browser === 'undefined') {
  browser = chrome;
}

/**
 * @description Chrome Web Store link
 * @type {string}
 */
const chromeUrl = 'https://chrome.google.com/webstore/detail/djcbfpkdhdkaflcigibkbpboflaplabg';

/**
 * @description Edge Add-ons link
 * @type {string}
 */
const edgeUrl =
  'https://microsoftedge.microsoft.com/addons/detail/hbogodfciblakeneadpcolhmfckmjcii';

/**
 * @description Firefox Add-ons link
 * @type {string}
 */
const firefoxUrl = 'https://addons.mozilla.org/firefox/addon/cookie-dialog-monster';

/**
 * @description Current hostname
 * @type {string}
 */
let hostname = '?';

/**
 * @description Is current browser an instance of Chromium?
 * @type {boolean}
 */
const isChromium = navigator.userAgent.indexOf('Chrome') !== -1;

/**
 * @description Is current browser an instance of Edge?
 * @type {boolean}
 */
const isEdge = navigator.userAgent.indexOf('Edg') !== -1;

/**
 * @description Is current browser an instance of Firefox?
 * @type {boolean}
 */
const isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;

/**
 * @description Popup state
 * @type {PopupState}
 */
let state = { on: true };

/**
 * @async
 * @description Setup stars handlers and result message links
 * @returns {Promise<void>}
 */
async function handleContentLoaded() {
  const tab = await browser.runtime.sendMessage({ type: 'GET_TAB' });

  hostname = tab?.url
    ? new URL(tab.url).hostname.split('.').slice(-3).join('.').replace('www.', '')
    : undefined;

  const next = await browser.runtime.sendMessage({ hostname, type: 'GET_STATE' });
  state = { ...(next ?? state), tabId: tab?.id };

  if (state.issue?.url) {
    const issueBanner = document.getElementById('issue-banner');
    issueBanner.removeAttribute('aria-hidden');

    const issueBannerText = document.getElementById('issue-banner-text');
    if (state.issue.flags.includes('wontfix'))
      issueBannerText.innerText = browser.i18n.getMessage('popup_bannerIssueWontFix');
    else issueBannerText.innerText = browser.i18n.getMessage('popup_bannerIssueOpen');

    const issueBannerUrl = document.getElementById('issue-banner-url');
    issueBannerUrl.setAttribute('href', state.issue.url);
  }

  const hostTextElement = document.getElementById('host');
  hostTextElement.innerText = hostname ?? 'unknown';

  const contributeButtonElement = document.getElementById('contribute-option');
  contributeButtonElement?.addEventListener('click', handleLinkRedirect);

  const databaseRefreshButtonElement = document.getElementById('refresh-database-button');
  databaseRefreshButtonElement?.addEventListener('click', handleDatabaseRefresh);

  const extensionVersionElement = document.getElementById('extension-version');
  extensionVersionElement.innerText = browser.runtime.getManifest().version;

  const helpButtonElement = document.getElementById('help-option');
  helpButtonElement?.addEventListener('click', handleLinkRedirect);

  const powerButtonElement = document.getElementById('power-option');
  powerButtonElement?.addEventListener('click', handlePowerToggle);
  if (state.on) powerButtonElement?.setAttribute('data-value', 'on');
  else powerButtonElement?.setAttribute('data-value', 'off');

  const rateButtonElement = document.getElementById('rate-option');
  rateButtonElement?.addEventListener('click', handleLinkRedirect);
  if (isEdge) rateButtonElement?.setAttribute('data-href', edgeUrl);
  else if (isChromium) rateButtonElement?.setAttribute('data-href', chromeUrl);
  else if (isFirefox) rateButtonElement?.setAttribute('data-href', firefoxUrl);

  const settingsButtonElement = document.getElementById('settings-button');
  settingsButtonElement.addEventListener('click', handleSettingsClick);

  translate();
  updateDatabaseVersion();
}

/**
 * @async
 * @description Refresh the database
 * @param {MouseEvent} event
 */
async function handleDatabaseRefresh(event) {
  const target = event.currentTarget;

  if (target.getAttribute('aria-disabled') === 'true') {
    return;
  }

  const checkIcon = target.querySelector('#refresh-database-check');
  const spinnerIcon = target.querySelector('#refresh-database-spinner');

  target.setAttribute('data-refreshing', 'true');
  target.setAttribute('aria-disabled', 'true');
  await browser.runtime.sendMessage({ type: 'REFRESH_DATA' });
  checkIcon.style.setProperty('display', 'block');
  spinnerIcon.style.setProperty('display', 'none');
  target.removeAttribute('data-animation');
  target.removeAttribute('data-refreshing');
  updateDatabaseVersion();

  window.setTimeout(() => {
    checkIcon.style.setProperty('display', 'none');
    spinnerIcon.style.setProperty('display', 'block');
    target.removeAttribute('aria-disabled');
    target.setAttribute('data-animation', 'flip');
  }, 5000);
}

/**
 * @async
 * @description Open a new tab
 * @param {MouseEvent} event
 * @returns {Promise<void>}
 */
async function handleLinkRedirect(event) {
  const { href } = event.currentTarget.dataset;

  if (href) {
    await browser.tabs.create({ url: href });
  }
}

/**
 * @description Disable or enable extension on current page
 * @returns {void}
 */
function handlePowerToggle() {
  const next = { on: !state.on };

  browser.runtime.sendMessage({ hostname, state: next, type: 'UPDATE_STORE' });
  browser.tabs.reload(state.tabId, { bypassCache: true });
  window.close();
}

/**
 * @async
 * @description Open options page
 * @returns {Promise<void>}
 */
async function handleSettingsClick() {
  await browser.runtime.openOptionsPage();
}

/**
 * @description Apply translations to tags with i18n data attribute
 * @returns {void}
 */
function translate() {
  const nodes = document.querySelectorAll('[data-i18n], [data-i18n-placeholder]');

  for (let i = nodes.length; i--; ) {
    const node = nodes[i];
    const { i18n, i18nPlaceholder } = node.dataset;

    if (i18n) {
      node.innerHTML = browser.i18n.getMessage(i18n);
    }

    if (i18nPlaceholder) {
      node.setAttribute('placeholder', browser.i18n.getMessage(i18nPlaceholder));
    }
  }
}

/**
 * @async
 * @description Update the database version element
 * @returns {Promise<void>}
 */
async function updateDatabaseVersion() {
  const data = await browser.runtime.sendMessage({ hostname, type: 'GET_DATA' });
  const databaseVersionElement = document.getElementById('database-version');

  if (data.version) databaseVersionElement.innerText = data.version;
  else databaseVersionElement.style.setProperty('display', 'none');
}

/**
 * @description Listen to document ready
 * @listens document#DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', handleContentLoaded);
