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

const firefoxUrl = 'https://addons.mozilla.org/es/firefox/addon/cookie-dialog-monster/';

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

  const like = document.getElementById('like');
  like.addEventListener('click', handleRate);

  const power = document.getElementById('power');
  power.addEventListener('change', handlePowerChange);
  if (!state.enabled) power.removeAttribute('checked');

  const store = document.getElementById('store');
  if (isEdge) store?.setAttribute('href', edgeUrl);
  else if (isChromium) store?.setAttribute('href', chromeUrl);
  else if (isFirefox) store?.setAttribute('href', firefoxUrl);

  const unlike = document.getElementById('unlike');
  unlike.addEventListener('click', handleRate);

  translate();
};

/**
 * @description Disables or enables extension on current page
 */

const handlePowerChange = async () => {
  state = { enabled: !state.enabled };
  dispatch({ hostname, state, type: 'UPDATE_STATE' });
  await chrome.tabs.reload({ bypassCache: true });
};

/**
 * @description Shows negative or positive messages
 * @param {MouseEvent} event
 */

const handleRate = (event) => {
  const negative = document.getElementById('negative');
  const positive = document.getElementById('positive');

  switch (event.currentTarget.id) {
    case 'unlike':
      positive.setAttribute('hidden', 'true');
      negative.removeAttribute('hidden');
      break;
    case 'like':
      negative.setAttribute('hidden', 'true');
      positive.removeAttribute('hidden');
      break;
    default:
      break;
  }
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
