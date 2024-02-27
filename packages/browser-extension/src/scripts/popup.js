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
 * @description Extension state
 * @type {{ enabled: boolean, tabId: number | undefined }}
 */
let state = { enabled: true, tabId: undefined };

/**
 * @async
 * @description Setup stars handlers and result message links
 * @returns {Promise<void>}
 */
async function handleContentLoaded() {
  const tab = await chrome.runtime.sendMessage({ type: 'GET_TAB' });

  hostname = tab?.url
    ? new URL(tab.url).hostname.split('.').slice(-3).join('.').replace('www.', '')
    : undefined;

  const next = await chrome.runtime.sendMessage({ hostname, type: 'GET_HOSTNAME_STATE' });
  state = { ...(next ?? state), tabId: tab?.id };

  const hostTextElement = document.getElementById('host');
  hostTextElement.innerText = hostname ?? 'unknown';

  const contributeButtonElement = document.getElementById('contribute-option');
  contributeButtonElement?.addEventListener('click', handleLinkRedirect);

  const helpButtonElement = document.getElementById('help-option');
  helpButtonElement?.addEventListener('click', handleLinkRedirect);

  const powerButtonElement = document.getElementById('power-option');
  powerButtonElement?.addEventListener('click', handlePowerToggle);
  if (state.enabled) powerButtonElement?.setAttribute('data-value', 'on');
  else powerButtonElement?.setAttribute('data-value', 'off');

  const rateButtonElement = document.getElementById('rate-option');
  rateButtonElement?.addEventListener('click', handleLinkRedirect);
  if (isEdge) rateButtonElement?.setAttribute('data-href', edgeUrl);
  else if (isChromium) rateButtonElement?.setAttribute('data-href', chromeUrl);
  else if (isFirefox) rateButtonElement?.setAttribute('data-href', firefoxUrl);

  const settingsButtonElement = document.getElementById('settings-button');
  settingsButtonElement.addEventListener('click', handleSettingsClick);

  translate();
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
    await chrome.tabs.create({ url: href });
  }
}

/**
 * @async
 * @description Disable or enable extension on current page
 * @param {MouseEvent} event
 * @returns {Promise<void>}
 */
async function handlePowerToggle(event) {
  const element = event.currentTarget;
  const next = { enabled: !state.enabled };

  chrome.runtime.sendMessage({ hostname, state: next, type: 'SET_HOSTNAME_STATE' });
  chrome.tabs.sendMessage(state.tabId, { type: next.enabled ? 'RUN' : 'RESTORE' });
  element.setAttribute('disabled', 'true');
  element.setAttribute('data-value', next.enabled ? 'on' : 'off');
  window.close();
}

/**
 * @description Open options page
 * @returns {void}
 */
function handleSettingsClick() {
  chrome.runtime.openOptionsPage();
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
      node.innerHTML = chrome.i18n.getMessage(i18n);
    }

    if (i18nPlaceholder) {
      node.setAttribute('placeholder', chrome.i18n.getMessage(i18nPlaceholder));
    }
  }
}

/**
 * @description Listen to document ready
 * @listens document#DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', handleContentLoaded);
