/**
 * @typedef {Object} ExtensionState
 * @property {ExtensionIssue} [issue]
 * @property {boolean} on
 * @property {string} [updateAvailable]
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
 * @description Shortcut to send messages to background script
 */
const dispatch = browser.runtime.sendMessage;

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
 * @description Close report form
 * @returns {void}
 */
function handleCancelClick() {
  const content = document.getElementsByClassName('content')[0];
  const report = document.getElementsByClassName('report')[0];

  if (content instanceof HTMLElement && report instanceof HTMLElement) {
    content.style.removeProperty('display');
    report.style.display = 'none';
  }
}

/**
 * @async
 * @description Setup stars handlers and result message links
 * @returns {Promise<void>}
 */
async function handleContentLoaded() {
  const tab = await dispatch({ type: 'GET_TAB' });
  const url = tab?.url ? new URL(tab.url) : undefined;

  hostname = url?.hostname.split('.').slice(-3).join('.').replace('www.', '');
  state = { ...((await dispatch({ hostname, type: 'GET_STATE' })) ?? state), tabId: tab?.id };

  const hostTextElement = document.getElementById('host');
  hostTextElement.innerText = hostname ?? 'unknown';

  const contributeButtonElement = document.getElementById('contribute-option');
  contributeButtonElement?.addEventListener('click', handleLinkRedirect);

  const databaseRefreshButtonElement = document.getElementById('refresh-database-button');
  databaseRefreshButtonElement?.addEventListener('click', handleDatabaseRefresh);

  const extensionVersionElement = document.getElementById('extension-version');
  extensionVersionElement.innerText = browser.runtime.getManifest().version;

  const helpButtonElement = document.getElementById('help-button');
  helpButtonElement?.addEventListener('click', handleLinkRedirect);

  const rateButtonElement = document.getElementById('rate-option');
  rateButtonElement?.addEventListener('click', handleLinkRedirect);
  if (isEdge) rateButtonElement?.setAttribute('data-href', edgeUrl);
  else if (isChromium) rateButtonElement?.setAttribute('data-href', chromeUrl);
  else if (isFirefox) rateButtonElement?.setAttribute('data-href', firefoxUrl);

  const settingsButtonElement = document.getElementById('settings-button');
  settingsButtonElement?.addEventListener('click', handleSettingsClick);

  translate();
  await updateDatabaseVersion();

  const { exclusions } = (await dispatch({ hostname, type: 'GET_DATA' })) ?? {};

  if (exclusions?.domains.some((x) => url.hostname.match(x.replaceAll(/\*/g, '[^ ]*')))) {
    const supportBanner = document.getElementById('support-banner');
    supportBanner.removeAttribute('aria-hidden');
    return;
  }

  if (state.issue?.url) {
    const issueBanner = document.getElementById('issue-banner');
    issueBanner.removeAttribute('aria-hidden');

    const issueBannerText = document.getElementById('issue-banner-text');
    if (state.issue.flags.includes('wontfix'))
      issueBannerText.innerText = browser.i18n.getMessage('popup_bannerIssueWontFix');
    else issueBannerText.innerText = browser.i18n.getMessage('popup_bannerIssueOpen');

    const issueBannerUrl = document.getElementById('issue-banner-url');
    issueBannerUrl.setAttribute('href', state.issue.url);
    return;
  }

  if (state.updateAvailable) {
    const updateBanner = document.getElementById('update-banner');
    updateBanner.removeAttribute('aria-hidden');

    const updateBannerUrl = document.getElementById('update-banner-url');
    updateBannerUrl.href += `/tag/${state.updateAvailable}`;
    return;
  }

  const cancelButtonElement = document.getElementsByClassName('report-cancel-button')[0];
  cancelButtonElement?.addEventListener('click', handleCancelClick);

  const powerButtonElement = document.getElementById('power-option');
  powerButtonElement?.addEventListener('click', handlePowerToggle);
  powerButtonElement?.removeAttribute('disabled');
  if (state.on) powerButtonElement?.setAttribute('data-value', 'on');
  else powerButtonElement?.setAttribute('data-value', 'off');

  const reasonInputElement = document.getElementById('report-input-reason');
  reasonInputElement?.addEventListener('input', handleInputChange);
  reasonInputElement?.addEventListener('keydown', handleInputKeyDown);

  const reportButtonElement = document.getElementById('report-option');
  reportButtonElement?.addEventListener('click', handleReportClick);
  reportButtonElement?.removeAttribute('disabled');

  const submitButtonElement = document.getElementsByClassName('report-submit-button')[0];
  submitButtonElement?.addEventListener('click', handleSubmitButtonClick);

  const urlInputElement = document.getElementById('report-input-url');
  urlInputElement?.addEventListener('input', handleInputChange);
  urlInputElement?.addEventListener('keydown', handleInputKeyDown);
  if (url) urlInputElement?.setAttribute('value', `${url.origin}${url.pathname}`);
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
  await dispatch({ type: 'REFRESH_DATA' });
  checkIcon.style.setProperty('display', 'block');
  spinnerIcon.style.setProperty('display', 'none');
  target.removeAttribute('data-animation');
  target.removeAttribute('data-refreshing');
  await updateDatabaseVersion();

  window.setTimeout(() => {
    checkIcon.style.setProperty('display', 'none');
    spinnerIcon.style.setProperty('display', 'block');
    target.removeAttribute('aria-disabled');
    target.setAttribute('data-animation', 'flip');
  }, 5000);
}

/**
 * @description Input change handler
 * @param {InputEvent} event
 */
function handleInputChange(event) {
  event.currentTarget.removeAttribute('aria-invalid');
}

/**
 * @description Input key down handler
 * @param {KeyboardEvent} event
 */
function handleInputKeyDown(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    event.currentTarget.blur();
  }
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
 * @async
 * @description Disable or enable extension on current page
 * @returns {void}
 */
async function handlePowerToggle() {
  const next = { on: !state.on };

  await dispatch({ hostname, state: next, type: 'UPDATE_STORE' });
  await browser.tabs.reload(state.tabId, { bypassCache: true });
  window.close();
}

/**
 * @description Show report form
 * @returns {void}
 */
function handleReportClick() {
  const content = document.getElementsByClassName('content')[0];
  const report = document.getElementsByClassName('report')[0];

  if (content instanceof HTMLElement && report instanceof HTMLElement) {
    content.style.display = 'none';
    report.style.removeProperty('display');
  }
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
 * @async
 * @description Report submit button click handler
 * @param {MouseEvent} event
 */
async function handleSubmitButtonClick(event) {
  event.preventDefault();

  if (event.currentTarget.getAttribute('aria-disabled') === 'true') {
    return;
  }

  event.currentTarget.setAttribute('aria-disabled', 'true');

  const reasonInput = document.getElementById('report-input-reason');
  const reasonText = reasonInput?.value.trim();
  const urlInput = document.getElementById('report-input-url');
  const urlText = urlInput?.value.trim();
  const errors = validateForm({ reason: reasonText, url: urlText });

  if (errors) {
    if (errors.reason) {
      reasonInput?.setAttribute('aria-invalid', 'true');
      reasonInput?.setAttribute('aria-errormessage', 'report-input-reason-error');
    }

    if (errors.url) {
      urlInput?.setAttribute('aria-invalid', 'true');
      urlInput?.setAttribute('aria-errormessage', 'report-input-url-error');
    }

    event.currentTarget.setAttribute('aria-disabled', 'false');
    return;
  }

  const issueButtons = document.getElementsByClassName('report-issue-button');
  const formView = document.getElementsByClassName('report-form-view')[0];
  const userAgent = window.navigator.userAgent;
  const response = await dispatch({ userAgent, reason: reasonText, url: urlText, type: 'REPORT' });
  const hostname = new URL(urlText).hostname.split('.').slice(-3).join('.').replace('www.', '');
  const issue = { expiresIn: Date.now() + 8 * 60 * 60 * 1000, flags: ['bug'], url: response.data };

  if (response.success) {
    const successView = document.getElementsByClassName('report-submit-success-view')[0];

    await dispatch({ hostname, state: { issue }, type: 'UPDATE_STORE' });
    await dispatch({ hostname, type: 'ENABLE_ICON' });
    formView?.setAttribute('hidden', 'true');
    issueButtons[1]?.addEventListener('click', () => window.open(response.data, '_blank'));
    successView?.removeAttribute('hidden');
    return;
  }

  if (response.data) {
    const errorView = document.getElementsByClassName('report-submit-error-view')[0];

    if (response.errors?.some((error) => error.includes('wontfix'))) {
      issue.flags.push('wontfix');
    }

    await dispatch({ hostname, state: { issue }, type: 'UPDATE_STORE' });
    errorView?.removeAttribute('hidden');
    formView?.setAttribute('hidden', 'true');
    issueButtons[0]?.addEventListener('click', () => window.open(response.data, '_blank'));
    return;
  }

  window.close();
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
  const data = await dispatch({ hostname, type: 'GET_DATA' });
  const databaseVersionElement = document.getElementById('database-version');

  if (data.version) databaseVersionElement.innerText = data.version;
  else databaseVersionElement.style.setProperty('display', 'none');
}

/**
 * @description Validate form
 * @param {{ reason: string | undefined | undefined, url: string | undefined }} params
 * @returns {{ reason: string | undefined, url: string | undefined } | undefined}
 */
function validateForm(params) {
  const { reason, url } = params;
  let errors = undefined;

  if (!reason || reason.length < 10 || reason.length > 1000) {
    errors = {
      ...(errors ?? {}),
      reason: browser.i18n.getMessage('report_reasonInputError'),
    };
  }

  try {
    new URL(url);
  } catch {
    errors = {
      ...(errors ?? {}),
      url: browser.i18n.getMessage('report_urlInputError'),
    };
  }

  return errors;
}

/**
 * @description Listen to document ready
 * @listens document#DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', handleContentLoaded);
