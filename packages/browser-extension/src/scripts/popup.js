/**
 * @description Chrome Web Store link
 * @type {string}
 */

const chromeUrl = 'https://chrome.google.com/webstore/detail/djcbfpkdhdkaflcigibkbpboflaplabg';

/**
 * @description Shortcut to send messages to background script
 */

const dispatch = chrome.runtime.sendMessage;

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
 * @type {{ enabled: boolean }}
 */

let state = { enabled: true };

/**
 * @async
 * @description Setup stars handlers and result message links
 * @returns {Promise<void>}
 */

async function handleContentLoaded() {
  const tab = await dispatch({ type: 'GET_TAB' });

  hostname = tab?.url
    ? new URL(tab.url).hostname.split('.').slice(-3).join('.').replace('www.', '')
    : undefined;
  state = (await dispatch({ hostname, type: 'GET_HOSTNAME_STATE' })) ?? state;

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
 * @description Opens a new tab
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
 * @description Disables or enables extension on current page
 * @param {MouseEvent} event
 * @returns {Promise<void>}
 */

async function handlePowerToggle(event) {
  state = { enabled: !state.enabled };
  dispatch({ hostname, state, type: 'SET_HOSTNAME_STATE' });
  if (state.enabled) event.currentTarget.setAttribute('data-value', 'on');
  else event.currentTarget.setAttribute('data-value', 'off');
  await chrome.tabs.reload({ bypassCache: true });
  window.close();
}

/**
 * @description Opens options page
 * @returns {void}
 */

function handleSettingsClick() {
  chrome.runtime.openOptionsPage();
}

/**
 * @description Applies translations to tags with i18n data attribute
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
