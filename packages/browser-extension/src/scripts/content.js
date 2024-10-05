/**
 * @typedef {Object} ExtensionData
 * @property {string[]} commonWords
 * @property {Fix[]} fixes
 * @property {{ domains: string[], tags: string[] }} skips
 * @property {{ backdrops: string[], classes: string[], containers: string[], selectors: string[] }} tokens
 */

/**
 * @typedef {Object} Fix
 * @property {string} action
 * @property {string} domain
 * @property {string} [property]
 * @property {string} selector
 */

/**
 * @typedef {Object} RunParams
 * @property {HTMLElement[]} [containers]
 * @property {HTMLElement[]} [elements]
 * @property {boolean} [skipMatch]
 */

/**
 * @typedef {Object} GetElementsParams
 * @property {boolean} [filterEarly]
 * @property {HTMLElement} [from]
 */

/**
 * @typedef {Object} SetUpParams
 * @property {boolean} [skipRunFn]
 */

if (typeof browser === 'undefined') {
  browser = chrome;
}

/**
 * @description Actions done by the extension
 * @type {Set<string>}
 */
let actions = new Set();

/**
 * @description Data object with all the necessary information
 * @type {ExtensionData}
 */
let { commonWords, fixes, skips, tokens } = {
  commonWords: [],
  fixes: [],
  skips: {
    domains: [],
    tags: [],
  },
  tokens: {
    backdrops: [],
    classes: [],
    selectors: [],
  },
};

/**
 * @description Attribute name
 */
const dataAttributeName = 'data-cookie-dialog-monster';

/**
 * @description Shortcut to send messages to background script
 */
const dispatch = browser.runtime.sendMessage;

/**
 * @description Current hostname
 * @type {string}
 */
const hostname = getHostname();

/**
 * @description Initial visibility state
 * @type {boolean}
 */
let initiallyVisible = document.visibilityState === 'visible';

/**
 * @description Options provided to observer
 * @type {MutationObserverInit}
 */
const options = { childList: true, subtree: true };

/**
 * @description Elements that were already matched and are removable
 * @type {Set<HTMLElement>}
 */
const seen = new Set();

/**
 * @description Extension state
 * @type {{ enabled: boolean }}
 */
let state = { enabled: true };

/**
 * @description Clean DOM
 * @param {Element[]} elements
 * @param {boolean} [skipMatch]
 * @returns {void}
 */
function clean(elements, skipMatch) {
  let index = 0;
  const size = 50;

  function chunk() {
    const end = Math.min(index + size, elements.length);

    for (; index < end; index++) {
      const element = elements[index];

      if (match(element, skipMatch)) {
        if (element instanceof HTMLDialogElement) element.close();
        hide(element);

        actions.add(new Date().getTime().toString());
        dispatch({ type: 'SET_BADGE', value: actions.size });
      }

      seen.add(element);
    }

    if (index < elements.length) {
      requestAnimationFrame(chunk);
    }
  }

  requestAnimationFrame(chunk);
}

/**
 * @description Check if element contains a common word
 * @param {HTMLElement} element
 */
function containsCommonWord(element) {
  return !!commonWords.length && !!element.outerHTML.match(new RegExp(commonWords.join('|')));
}

/**
 * @description Force a DOM clean in the specific element
 * @param {HTMLElement} from
 * @returns {void}
 */
function forceClean(from) {
  const elements = getElements(tokens.selectors, { filterEarly: true, from });

  if (elements.length) {
    fix();
    clean(elements, true);
  }
}

/**
 * Get all elements that match the selector
 * @param {string | string[]} [selector]
 * @param {GetElementsParams} [params]
 * @returns {HTMLElement[]}
 */
function getElements(selector, params = {}) {
  const { filterEarly, from } = params;
  let result = [];

  if (selector?.length) {
    result = [...(from ?? document).querySelectorAll(selector)];

    if (filterEarly) {
      result = result.flatMap((node) => filterNodeEarly(node));
    }
  }

  return result;
}

/**
 * Get all elements with their children that match the selector
 * @param {string | string[]} selector
 * @param {GetElementsParams} [params]
 * @returns {HTMLElement[]}
 */
function getElementsWithChildren(selector, params) {
  return getElements(selector, params).flatMap((element) => [element, ...element.children]);
}

/**
 * @description Calculate current hostname
 * @returns {string}
 */
function getHostname() {
  let hostname = document.location.hostname;
  const referrer = document.referrer;

  if (referrer && window.self !== window.top) {
    hostname = new URL(referrer).hostname;
  }

  return hostname.split('.').slice(-3).join('.').replace('www.', '');
}

/**
 * @description Check if an element is visible in the viewport
 * @param {HTMLElement} element
 * @returns {boolean}
 */
function isInViewport(element) {
  const styles = window.getComputedStyle(element);
  const height = window.innerHeight || document.documentElement.clientHeight;
  const position = element.getBoundingClientRect();
  const scroll = window.scrollY;

  return (
    position.bottom === position.top ||
    (scroll + position.top <= scroll + height && scroll + position.bottom >= scroll) ||
    styles.animationDuration !== '0s' ||
    styles.transitionDuration !== '0s'
  );
}

/**
 * @description Check if element element is removable
 * @param {Element} element
 * @param {boolean} [skipMatch]
 * @returns {boolean}
 */
function match(element, skipMatch) {
  if (!tokens.selectors.length || !skips.tags.length) {
    return false;
  }

  if (!(element instanceof HTMLElement) || !element.tagName) {
    return false;
  }

  if (element.getAttribute(dataAttributeName)) {
    return false;
  }

  if (seen.has(element)) {
    return false;
  }

  const tagName = element.tagName.toUpperCase();

  if (skips.tags.includes(tagName)) {
    return false;
  }

  const hasAttributes = !!element.getAttributeNames().filter((x) => x !== 'data-nosnippet').length;

  if (!hasAttributes && !tagName.includes('-')) {
    forceClean(element);
  }

  // 2023-06-10: fix #113 temporarily
  if (element.classList.contains('chat-line__message')) {
    return false;
  }

  // 2024-08-03: fix #701 temporarily
  if (element.classList.contains('sellos')) {
    return false;
  }

  const isDialog = tagName === 'DIALOG' && element.getAttribute('open') === 'true';
  const isFakeDialog = tagName === 'DIV' && element.className.includes('cmp');

  return (
    (isDialog || isFakeDialog || isInViewport(element)) &&
    (skipMatch || element.matches(tokens.selectors))
  );
}

/**
 * @description Filter early nodes
 * @param {Node} node
 * @param {boolean} stopRecursion
 * @returns {HTMLElement[]}
 */
function filterNodeEarly(node, stopRecursion) {
  if (node.nodeType !== Node.ELEMENT_NODE || !(node instanceof HTMLElement)) {
    return [];
  }

  if (commonWords && containsCommonWord(node) && !stopRecursion) {
    return [node, ...[...node.children].flatMap((node) => filterNodeEarly(node, true))];
  }

  return [node];
}

/**
 * @description Fix data, middle consent page and scroll issues
 * @returns {void}
 */
function fix() {
  const backdrops = getElements(tokens.backdrops);
  const domains = skips.domains.map((x) => (x.split('.').length < 3 ? `*${x}` : x));

  for (const backdrop of backdrops) {
    if (backdrop.children.length === 0 && !backdrop.hasAttribute(dataAttributeName)) {
      actions.add(new Date().getTime().toString());
      backdrop.setAttribute(dataAttributeName, 'true');
    }
  }

  if (domains.every((x) => !hostname.match(x.replaceAll(/\*/g, '[^ ]*')))) {
    for (const element of [document.body, document.documentElement]) {
      element?.classList.remove(...(tokens.classes ?? []));
      element?.style.setProperty('position', 'initial', 'important');
      element?.style.setProperty('overflow-y', 'initial', 'important');
    }
  }

  for (const fix of fixes) {
    const { action, domain, property, selector } = fix;

    if (hostname.includes(domain)) {
      switch (action) {
        case 'click': {
          const element = document.querySelector(selector);

          actions.add('click');
          element?.click();
          break;
        }
        case 'remove': {
          const element = document.querySelector(selector);

          actions.add('remove');
          element?.style?.removeProperty(property);
          break;
        }
        case 'reload': {
          window.location.reload();
          break;
        }
        case 'reset': {
          const element = document.querySelector(selector);

          actions.add('reset');
          element?.style?.setProperty(property, 'initial', 'important');
          break;
        }
        case 'resetAll': {
          const elements = getElements(selector);

          actions.add('resetAll');
          elements.forEach((e) => e?.style?.setProperty(property, 'initial', 'important'));
          break;
        }
      }
    }
  }

  const ionRouterOutlet = document.getElementsByTagName('ion-router-outlet')[0];

  if (ionRouterOutlet) {
    actions.add('ion-router-outlet');
    // 2024-08-02: fix #644 temporarily
    ionRouterOutlet.removeAttribute('inert');
  }

  const t4Wrapper = document.getElementsByClassName('t4-wrapper')[0];

  if (t4Wrapper) {
    actions.add('t4-wrapper');
    // 2024-09-12: fix #945 temporarily
    t4Wrapper.removeAttribute('inert');
  }

  dispatch({ type: 'SET_BADGE', value: actions.size });
}

/**
 * @description Hide DOM element
 * @param {HTMLElement} element
 * @returns {void}
 */
function hide(element) {
  element.style.setProperty('clip-path', 'circle(0px)', 'important');
  element.style.setProperty('display', 'none', 'important');
  element.style.setProperty('height', '0px', 'important');
  element.style.setProperty('overflow', 'hidden', 'important');
  element.style.setProperty('transform', 'scale(0)', 'important');
}

/**
 * @description Clean DOM when this function is called
 * @param {RunParams} [params]
 * @returns {void}
 */
function run(params = {}) {
  const { containers, elements, skipMatch } = params;

  if (document.body?.children.length && state.enabled && tokens.selectors.length) {
    fix();

    if (elements?.length) {
      clean(elements, skipMatch);
    }

    if (elements === undefined && containers?.length) {
      clean(containers.flatMap((x) => getElementsWithChildren(x, { filterEarly: true })));
    }
  }
}

/**
 * @async
 * @description Set up the extension
 * @param {SetUpParams} [params]
 */
async function setUp(params = {}) {
  state = (await dispatch({ hostname, type: 'GET_HOSTNAME_STATE' })) ?? state;
  dispatch({ type: 'ENABLE_POPUP' });

  if (state.enabled) {
    const data = await dispatch({ hostname, type: 'GET_DATA' });

    commonWords = data?.commonWords ?? commonWords;
    fixes = data?.fixes ?? fixes;
    skips = data?.skips ?? skips;
    tokens = data?.tokens ?? tokens;

    dispatch({ type: 'ENABLE_ICON' });
    dispatch({ type: 'SET_BADGE', value: actions.size });
    observer.observe(document.body ?? document.documentElement, options);
    if (!params.skipRunFn) run({ containers: tokens.containers });
  } else {
    dispatch({ type: 'DISABLE_ICON' });
    dispatch({ type: 'SET_BADGE', value: actions.size });
    observer.disconnect();
  }
}

/**
 * @description Mutation Observer instance
 * @type {MutationObserver}
 */
const observer = new MutationObserver((mutations) => {
  if (!state.enabled || !tokens.selectors.length) {
    return;
  }

  const nodes = mutations.flatMap((mutation) => [...mutation.addedNodes]);
  const elements = nodes.flatMap((node) => filterNodeEarly(node));

  run({ elements });
});

/**
 * @description Listen to messages from any other scripts
 * @listens browser.runtime#onMessage
 */
browser.runtime.onMessage.addListener(async (message) => {
  switch (message.type) {
    case 'INCREASE_ACTIONS_COUNT': {
      actions.add(new Date().getTime().toString());
      break;
    }
  }
});

/**
 * @async
 * @description Fix still existing elements when page loads
 * @listens window#DOMContentLoaded
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', async () => {
  if (document.visibilityState === 'visible') {
    await setUp();
  }
});

/**
 * @description Fix bfcache issues
 * @listens window#pageshow
 * @returns {void}
 */
window.addEventListener('pageshow', async (event) => {
  if (document.visibilityState === 'visible' && event.persisted) {
    await setUp();
  }
});

/**
 * @async
 * @description Run run if the page wasn't visible yet
 * @listens window#visibilitychange
 * @returns {void}
 */
window.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && !initiallyVisible) {
    initiallyVisible = true;
    await setUp();
  }
});
