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
 */

const handleContentLoaded = async () => {
  const tab = await dispatch({ type: 'GET_TAB' });

  hostname = tab?.url
    ? new URL(tab.url).hostname.split('.').slice(-3).join('.').replace('www.', '')
    : undefined;
  state = (await dispatch({ hostname, type: 'GET_STATE' })) ?? state;

  const host = document.getElementById('host');
  host.innerText = hostname ?? 'unknown';

  const contribute = document.getElementById('contribute-option');
  contribute?.addEventListener('click', handleLinkRedirect);

  const help = document.getElementById('help-option');
  help?.addEventListener('click', handleLinkRedirect);

  const power = document.getElementById('power-option');
  power?.addEventListener('click', handlePowerToggle);
  if (state.enabled) power?.setAttribute('data-value', 'on');
  else power?.setAttribute('data-value', 'off');

  const rate = document.getElementById('rate-option');
  rate?.addEventListener('click', handleLinkRedirect);
  if (isEdge) rate?.setAttribute('data-href', edgeUrl);
  else if (isChromium) rate?.setAttribute('data-href', chromeUrl);
  else if (isFirefox) rate?.setAttribute('data-href', firefoxUrl);

  translate();
};

/**
 * @async
 * @description Opens a new tab
 * @param {MouseEvent} event
 */

const handleLinkRedirect = async (event) => {
  const { href } = event.currentTarget.dataset;

  if (href) {
    await chrome.tabs.create({ url: href });
  }
};

/**
 * @description Disables or enables extension on current page
 * @param {MouseEvent} event
 */

const handlePowerToggle = async (event) => {
  state = { enabled: !state.enabled };
  dispatch({ hostname, state, type: 'UPDATE_STATE' });
  if (state.enabled) event.currentTarget.setAttribute('data-value', 'on');
  else event.currentTarget.setAttribute('data-value', 'off');
  await chrome.tabs.reload({ bypassCache: true });
};

/**
 * @description Applies translations to tags with i18n data attribute
 */

const translate = () => {
  const nodes = document.querySelectorAll('[data-i18n]');

  for (let i = nodes.length; i--; ) {
    const node = nodes[i];
    const { i18n } = node.dataset;

    node.innerHTML = chrome.i18n.getMessage(i18n);
  }
};

/**
 * @description Listen to document ready
 * @listens document#DOMContentLoaded
 */

document.addEventListener('DOMContentLoaded', handleContentLoaded);
