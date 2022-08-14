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
  const targets = nodes.filter((node) => skipMatch || match(node));

  targets.forEach((node) => {
    console.log(node);
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
 * @description Matches if node element is removable
 * @param {Element} node
 * @returns {boolean}
 */

const match = (node) => {
  if (!(node instanceof HTMLElement)) return false;

  const rect = node.getBoundingClientRect();
  const isFullscreen = rect.bottom + rect.top > 0 && rect.bottom - rect.top === 0;
  const isVisible = rect.top <= (window.innerHeight || document.documentElement.clientHeight);

  return (
    !data?.tags.includes(node.tagName?.toUpperCase?.()) &&
    (isFullscreen || isVisible) &&
    (node.offsetParent || window.getComputedStyle(node).position === 'fixed') &&
    node.parentElement &&
    node.matches(data?.elements ?? [])
  );
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
    observer.observe(document.body ?? document.documentElement, options);
    dispatch({ type: 'ENABLE_ICON' });
  }
})();
