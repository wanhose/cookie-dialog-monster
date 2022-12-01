/**
 * @description Data properties
 * @type {{ classes: string[], fixes: string[], elements: string[], skips: string[], tags: string[] }?}
 */

let data = null;

/**
 * @description Shortcut to send messages to background script
 */

const dispatch = chrome.runtime.sendMessage;

/**
 * @description Current hostname
 * @type {string}
 */

const hostname = document.location.hostname.split('.').slice(-3).join('.').replace('www.', '');

/**
 * @description Options provided to observer
 * @type {MutationObserverInit}
 */

const options = { childList: true, subtree: true };

/**
 * @description Is consent preview page?
 */

const preview = hostname.startsWith('consent.') || hostname.startsWith('myprivacy.');

/**
 * @description Element that were being removed count
 * @type {number}
 */

let elementCount = 0;

/**
 * @description Extension state
 * @type {{ enabled: boolean }}
 */

let state = { enabled: true };

/**
 * @description Cleans DOM
 * @param {Element[]} nodes
 * @param {boolean?} skipMatch
 * @returns {void}
 */

const clean = (nodes, skipMatch) => {
  const targets = nodes.filter((node) => match(node, skipMatch));

  targets.forEach((node) => {
    node.remove();
    elementCount += 1;
  });
};

/**
 * @description Cleans DOM
 * @returns {void}
 */

const forceClean = () => {
  if (data?.elements.length && state.enabled && !preview) {
    const nodes = [...document.querySelectorAll(data.elements)];

    if (nodes.length) {
      fix();
      clean(nodes, true);
      elementCount += nodes.length;
    }
  }
};

/**
 * @description Checks if an element is visible in the viewport
 * @param {HTMLElement} node
 * @returns {boolean}
 */

const isInViewport = (node) => {
  const bounding = node.getBoundingClientRect();

  return (
    bounding.top >= -node.offsetHeight &&
    bounding.left >= -node.offsetWidth &&
    bounding.right <=
      (window.innerWidth || document.documentElement.clientWidth) + node.offsetWidth &&
    bounding.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) + node.offsetHeight
  );
};

/**
 * @description Matches if node element is removable
 * @param {Element} node
 * @param {boolean?} skipMatch
 * @returns {boolean}
 */

const match = (node, skipMatch) => {
  if (node instanceof HTMLElement) {
    const style = window.getComputedStyle(node);
    const skipIsInViewport =
      style.display === 'none' ||
      style.height === '0px' ||
      style.opacity === '0' ||
      style.visibility === 'hidden';

    return (
      !data?.tags.includes(node.tagName?.toUpperCase?.()) &&
      (skipIsInViewport || isInViewport(node)) &&
      (!!node.offsetParent || style.position === 'fixed') &&
      !!node.parentElement &&
      (skipMatch || node.matches(data?.elements ?? []))
    );
  }

  return false;
};

/**
 * @description Fixes scroll issues
 */

const fix = () => {
  document.getElementsByClassName('_31e')[0]?.classList.remove('_31e');

  if (data?.skips.length && !data.skips.includes(hostname)) {
    for (const item of [document.body, document.documentElement]) {
      item?.classList.remove(...(data?.classes ?? []));
      item?.style.setProperty('position', 'initial', 'important');
      item?.style.setProperty('overflow-y', 'initial', 'important');
    }
  }

  for (const fix of data?.fixes ?? []) {
    const [match, selector, action, property] = fix.split('##');

    if (hostname.includes(match)) {
      switch (action) {
        case 'click': {
          const node = document.querySelector(selector);
          node?.click();
          break;
        }
        case 'remove': {
          const node = document.querySelector(selector);
          node?.style?.removeProperty(property);
          break;
        }
        case 'reset': {
          const node = document.querySelector(selector);
          node?.style?.setProperty(property, 'initial', 'important');
          break;
        }
        case 'resetAll': {
          const nodes = document.querySelectorAll(selector);
          nodes.forEach((node) => node?.style?.setProperty(property, 'initial', 'important'));
          break;
        }
        default:
          break;
      }
    }
  }
};

/**
 * @description Mutation Observer instance
 * @type {MutationObserver}
 */

const observer = new MutationObserver((mutations) => {
  const nodes = mutations.map((mutation) => Array.from(mutation.addedNodes)).flat();

  fix();
  if (data?.elements.length && !preview) clean(nodes);
});

/**
 * @description Fixes already existing element when page load issues
 * @listens window#load
 */

window.addEventListener('load', () => {
  if (elementCount < 2) forceClean();
});

/**
 * @description Fixes bfcache issues
 * @listens window#pageshow
 */

window.addEventListener('pageshow', (event) => {
  if (event.persisted) forceClean();
});

/**
 * @async
 * @description Sets up everything
 */

(async () => {
  state = (await dispatch({ hostname, type: 'GET_STATE' })) ?? state;
  dispatch({ type: 'ENABLE_POPUP' });

  if (state.enabled) {
    data = await dispatch({ hostname, type: 'GET_DATA' });
    dispatch({ type: 'ENABLE_ICON' });
    dispatch({ type: 'INSERT_CONTENT_CSS' });
    observer.observe(document.body ?? document.documentElement, options);
  }
})();
