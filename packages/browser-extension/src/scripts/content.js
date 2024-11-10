/**
 * @typedef {Object} Action
 * @property {string} domain
 * @property {string} name
 * @property {string} [property]
 * @property {string} selector
 */

/**
 * @typedef {Object} ContentState
 * @property {boolean} on
 */

/**
 * @typedef {Object} ExclusionMap
 * @property {string[]} domains
 * @property {string[]} overflows
 * @property {string[]} tags
 */

/**
 * @typedef {Object} ExtensionData
 * @property {Action[]} actions
 * @property {ExclusionMap} exclusions
 * @property {string[]} keywords
 * @property {TokenMap} tokens
 */

/**
 * @typedef {Object} GetElementsParams
 * @property {boolean} [filterEarly]
 * @property {HTMLElement} [from]
 */

/**
 * @typedef {Object} RunParams
 * @property {HTMLElement[]} [containers]
 * @property {HTMLElement[]} [elements]
 * @property {boolean} [skipMatch]
 */

/**
 * @typedef {Object} TokenMap
 * @property {string[]} backdrops
 * @property {string[]} classes
 * @property {string[]} containers
 * @property {string[]} selectors
 */

/**
 * @typedef {Object} SetUpParams
 * @property {boolean} [skipRunFn]
 */

if (typeof browser === 'undefined') {
  browser = chrome;
}

/**
 * @description Class for request batching
 */
class NotifiableSet extends Set {
  constructor(...args) {
    super(...args);
  }

  add(value) {
    super.add(value);
    browser.runtime.sendMessage({ type: 'UPDATE_BADGE', value: super.size });
  }
}

/**
 * @description Data object with all the necessary information
 * @type {ExtensionData}
 */
let { actions, exclusions, keywords, tokens } = {
  actions: [],
  exclusions: {
    domains: [],
    overflows: [],
    tags: [],
  },
  keywords: [],
  tokens: {
    backdrops: [],
    classes: [],
    selectors: [],
  },
};

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
let initiallyVisible = false;

/**
 * @description Log of those steps done by the extension
 * @type {NotifiableSet<string>}
 */
const log = new NotifiableSet();

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
 * @type {ContentState | undefined}
 */
let state = undefined;

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

        log.add(`${Date.now()}`);
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
 * @description Check if element contains a keyword
 * @param {HTMLElement} element
 */
function hasKeyword(element) {
  return !!keywords?.length && !!element.outerHTML.match(new RegExp(keywords.join('|')));
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
 * @async
 * @description Run if the page wasn't visited yet
 * @param {Object} message
 * @returns {Promise<void>}
 */
function handleRuntimeMessage(message) {
  switch (message.type) {
    case 'INCREASE_ACTIONS_COUNT': {
      log.add(message.value);
      break;
    }
  }
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
  if (!exclusions.tags.length || !tokens.selectors.length) {
    return false;
  }

  if (!(element instanceof HTMLElement) || !element.tagName) {
    return false;
  }

  if (seen.has(element)) {
    return false;
  }

  const tagName = element.tagName.toUpperCase();

  if (exclusions.tags.includes(tagName)) {
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

  if (hasKeyword(node) && !stopRecursion) {
    return [node, ...[...node.children].flatMap((node) => filterNodeEarly(node, true))];
  }

  return [node];
}

/**
 * @description Fix specific cases
 * @returns {void}
 */
function fix() {
  for (const action of actions) {
    const { domain, name, property, selector } = action;

    if (hostname.match(domain.replaceAll(/\*/g, '[^ ]*'))) {
      switch (name) {
        case 'click': {
          const element = document.querySelector(selector);

          element?.click();
          log.add(name);
          break;
        }
        case 'remove': {
          const element = document.querySelector(selector);

          element?.style?.removeProperty(property);
          log.add(name);
          break;
        }
        case 'reload': {
          window.location.reload();
          break;
        }
        case 'reset': {
          const element = document.querySelector(selector);

          element?.style?.setProperty(property, 'initial', 'important');
          log.add(name);
          break;
        }
        case 'resetAll': {
          const elements = getElements(selector);

          elements.forEach((e) => e?.style?.setProperty(property, 'initial', 'important'));
          log.add(name);
          break;
        }
      }
    }
  }

  const backdrops = getElements(tokens.backdrops);

  for (const backdrop of backdrops) {
    if (backdrop.children.length === 0 && !seen.has(backdrop)) {
      log.add(`${Date.now()}`);
      seen.add(backdrop);
      hide(backdrop);
    }
  }

  const skips = exclusions.overflows.map((x) => (x.split('.').length < 3 ? `*${x}` : x));

  if (!skips.some((x) => hostname.match(x.replaceAll(/\*/g, '[^ ]*')))) {
    for (const element of [document.body, document.documentElement]) {
      element?.classList.remove(...(tokens.classes ?? []));
      element?.style.setProperty('position', 'initial', 'important');
      element?.style.setProperty('overflow-y', 'initial', 'important');
    }
  }

  const ionRouterOutlet = document.getElementsByTagName('ion-router-outlet')[0];

  if (ionRouterOutlet) {
    // 2024-08-02: fix #644 temporarily
    ionRouterOutlet.removeAttribute('inert');
    log.add('ion-router-outlet');
  }

  const t4Wrapper = document.getElementsByClassName('t4-wrapper')[0];

  if (t4Wrapper) {
    log.add('t4-wrapper');
    // 2024-09-12: fix #945 temporarily
    t4Wrapper.removeAttribute('inert');
  }
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

  if (document.body?.children.length && state.on && tokens.selectors.length) {
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
 * @returns {Promise<void>}
 */
async function setUp(params = {}) {
  const data = await dispatch({ hostname, type: 'GET_DATA' });

  exclusions = data?.exclusions ?? exclusions;

  if (exclusions.domains.some((x) => location.hostname.match(x.replaceAll(/\*/g, '[^ ]*')))) {
    dispatch({ type: 'DISABLE_ICON' });
    observer.disconnect();
    return;
  }

  state = await dispatch({ hostname, type: 'GET_STATE' });

  if (state.on) {
    browser.runtime.onMessage.addListener(handleRuntimeMessage);
    dispatch({ hostname, type: 'ENABLE_ICON' });

    actions = data?.actions ?? actions;
    keywords = data?.keywords ?? keywords;
    tokens = data?.tokens ?? tokens;

    observer.observe(document.body ?? document.documentElement, options);
    if (!params.skipRunFn) run({ containers: tokens.containers });
  }
}

/**
 * @description Wait for the body to exist
 * @returns {Promise<void>}
 */
async function setUpAfterWaitForBody() {
  if (document.visibilityState === 'visible' && !initiallyVisible) {
    if (document.body) {
      initiallyVisible = true;
      await setUp();
      return;
    }

    setTimeout(setUpAfterWaitForBody, 50);
  }
}

/**
 * @description Mutation Observer instance
 * @type {MutationObserver}
 */
const observer = new MutationObserver((mutations) => {
  if (!state.on || !tokens.selectors.length) {
    return;
  }

  const nodes = mutations.flatMap((mutation) => [...mutation.addedNodes]);
  const elements = nodes.flatMap((node) => filterNodeEarly(node));

  run({ elements });
});

document.addEventListener('visibilitychange', setUpAfterWaitForBody);
window.addEventListener('pageshow', setUpAfterWaitForBody);
setUpAfterWaitForBody();
