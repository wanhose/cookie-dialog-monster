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
 * @description Disables or enables extension on current page
 */

const handlePowerChange = async () => {
  const state = await dispatch({ hostname, type: 'GET_STATE' });
  dispatch({ hostname, state: { enabled: !state.enabled }, type: 'UPDATE_STATE' });
  chrome.tabs.reload({ bypassCache: true });
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
 * @description Setup stars handlers and result message links
 */

const handleContentLoaded = async () => {
  const tab = await dispatch({ type: 'GET_TAB' });
  hostname = tab?.url ? new URL(tab.url).hostname.split('.').slice(-2).join('.') : undefined;
  const state = await dispatch({ hostname, type: 'GET_STATE' });

  translate();

  const host = document.getElementById('host');
  const like = document.getElementById('like');
  const power = document.getElementById('power');
  const reload = document.getElementById('reload');
  const store = document.getElementById('store');
  const unlike = document.getElementById('unlike');

  like.addEventListener('click', handleRate);
  power.addEventListener('change', handlePowerChange);
  reload.addEventListener('click', () => chrome.tabs.reload({ bypassCache: true }));
  unlike.addEventListener('click', handleRate);

  host.innerText = hostname?.replace('www.', '');
  if (isEdge) store?.setAttribute('href', edgeUrl);
  else if (isChromium) store?.setAttribute('href', chromeUrl);
  else if (isFirefox) store?.setAttribute('href', firefoxUrl);
  if (!state.enabled) power.removeAttribute('checked');
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
 * @listens document#ready
 */

document.addEventListener('DOMContentLoaded', handleContentLoaded);
