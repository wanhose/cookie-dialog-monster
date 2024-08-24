/**
 * @typedef {Object} ExtensionData
 * @property {string[]} commonWords
 * @property {Fix[]} fixes
 * @property {{ domains: string[], tags: string[] }} skips
 * @property {{ backdrops: string[], classes: string[], selectors: string[] }} tokens
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
 * @property {HTMLElement[]} [elements]
 * @property {boolean} [skipMatch]
 */

/**
 * @typedef {Object} SetUpParams
 * @property {boolean} [skipRunFn]
 */

if (typeof browser === 'undefined') {
  browser = chrome;
}

/**
 * @description Matched elements count
 * @type {number}
 */
let count = 0;

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
 * @description Is consent preview page?
 */
const preview =
  (hostname.startsWith('consent.') &&
    !(hostname.startsWith('consent.google') || hostname.startsWith('consent.youtube'))) ||
  hostname.startsWith('myprivacy.');

/**
 * @description Elements that were already matched and are removable
 * @type {HTMLElement[]}
 */
const removables = [];

/**
 * @description Elements that were already seen
 * @type {HTMLElement[]}
 */
const seen = [];

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
        const observer = new MutationObserver(forceElementStyles);

        element.setAttribute(dataAttributeName, 'true');
        element.style.setProperty('display', 'none', 'important');

        observer.observe(element, {
          attributes: true,
          attributeFilter: [dataAttributeName, 'class', 'style'],
        });

        count += 1;
        dispatch({ type: 'SET_BADGE', value: `${count}` });

        if (!removables.includes(element)) {
          removables.push(element);
        }
      }

      seen.push(element);
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
 * @param {HTMLElement} element
 * @returns {void}
 */
function forceClean(element) {
  const nodes = [...element.querySelectorAll(tokens.selectors)];
  const elements = nodes.flatMap((node) => filterNodeEarly(node));

  if (elements.length) {
    fix();
    clean(elements, true);
  }
}

/**
 * @description Force element to have these styles
 * @type {MutationCallback}
 */
function forceElementStyles(mutations, observer) {
  for (const mutation of mutations) {
    const element = mutation.target;
    const value = element.getAttribute(dataAttributeName);

    if (value === null) {
      observer.disconnect();
      element.removeAttribute(dataAttributeName);
      element.style.removeProperty('display');
    } else {
      element.style.setProperty('display', 'none', 'important');
    }
  }
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
  const transitioning = styles.transitionDuration !== '0s';

  return (
    position.bottom === position.top ||
    (scroll + position.top <= scroll + height && scroll + position.bottom >= scroll) ||
    transitioning
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

  if (seen.includes(element)) {
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
  const backdrops = tokens.backdrops?.length
    ? [...document.querySelectorAll(tokens.backdrops)]
    : [];
  const domains = skips.domains.map((x) => (x.split('.').length < 3 ? `*${x}` : x));

  for (const backdrop of backdrops) {
    if (backdrop.children.length === 0 && backdrop.style.display !== 'none') {
      backdrop.style.setProperty('display', 'none');
      count += 1;
      dispatch({ type: 'SET_BADGE', value: `${count}` });
    }
  }

  // 2024-08-02: fix #644 temporarily
  document.getElementsByTagName('ion-router-outlet')[0]?.removeAttribute('inert');

  for (const fix of fixes) {
    const { action, domain, property, selector } = fix;

    if (hostname.includes(domain)) {
      switch (action) {
        case 'click': {
          const element = document.querySelector(selector);
          element?.click();
          break;
        }
        case 'remove': {
          const element = document.querySelector(selector);
          element?.style?.removeProperty(property);
          break;
        }
        case 'reset': {
          const element = document.querySelector(selector);
          element?.style?.setProperty(property, 'initial', 'important');
          break;
        }
        case 'resetAll': {
          const elements = document.querySelectorAll(selector);
          elements.forEach((e) => e?.style?.setProperty(property, 'initial', 'important'));
          break;
        }
      }
    }
  }

  if (domains.every((x) => !hostname.match(x.replaceAll(/\*/g, '[^ ]*')))) {
    for (const element of [document.body, document.documentElement]) {
      element?.classList.remove(...(tokens.classes ?? []));
      element?.style.setProperty('position', 'initial', 'important');
      element?.style.setProperty('overflow-y', 'initial', 'important');
    }
  }
}

/**
 * @description Restore DOM to its previous state
 * @returns {void}
 */
function restoreDOM() {
  const backdrops = tokens.backdrops?.length
    ? [...document.querySelectorAll(tokens.backdrops)]
    : [];

  for (const backdrop of backdrops) {
    if (backdrop.children.length === 0 && backdrop.hasAttribute(dataAttributeName)) {
      backdrop.style.removeProperty('display');
    }
  }

  const elements = [...document.querySelectorAll(`[${dataAttributeName}]`)];

  for (const element of elements) {
    element.removeAttribute(dataAttributeName);
  }

  for (const element of [document.body, document.documentElement]) {
    element?.style.removeProperty('position');
    element?.style.removeProperty('overflow-y');
  }

  count = 0;
  seen.splice(0, seen.length);
}

/**
 * @description Clean DOM when this function is called
 * @param {RunParams} [params]
 * @returns {void}
 */
function run(params = {}) {
  if (document.body?.children.length && !preview && state.enabled && tokens.selectors.length) {
    fix();

    if (params.elements?.length) {
      clean(params.elements, params.skipMatch);
    }

    if (params.elements === undefined) {
      // 2024-08-03: look into the first level of important nodes, there are dialogs there very often
      clean(
        [
          ...document.body.children,
          ...[...(document.getElementsByClassName('container')[0]?.children ?? [])],
          ...[...(document.getElementsByClassName('layout')[0]?.children ?? [])],
          ...[...(document.getElementsByClassName('page')[0]?.children ?? [])],
          ...[...(document.getElementsByClassName('wrapper')[0]?.children ?? [])],
          ...[...(document.getElementById('__next')?.children ?? [])],
          ...[...(document.getElementById('app')?.children ?? [])],
          ...[...(document.getElementById('main')?.children ?? [])],
          ...[...(document.getElementById('root')?.children ?? [])],
        ].flatMap((node) => filterNodeEarly(node))
      );
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

    if (count > 0) {
      dispatch({ type: 'SET_BADGE', value: `${count}` });
    }

    dispatch({ type: 'ENABLE_ICON' });
    observer.observe(document.body ?? document.documentElement, options);

    if (!params.skipRunFn) {
      run();
    }
  } else {
    dispatch({ type: 'DISABLE_ICON' });
    observer.disconnect();
  }
}

/**
 * @description Mutation Observer instance
 * @type {MutationObserver}
 */
const observer = new MutationObserver((mutations) => {
  if (preview || !state.enabled || !tokens.selectors.length) {
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
    case 'RESTORE': {
      restoreDOM();
      await setUp({ skipRunFn: true });
      break;
    }
    case 'RUN': {
      await setUp({ skipRunFn: true });
      run(removables.length ? { elements: removables, skipMatch: true } : {});
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
window.addEventListener('DOMContentLoaded', async () => {
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
    run();
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
