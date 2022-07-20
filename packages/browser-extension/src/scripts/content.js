/**
 * @description Data properties
 * @type {{ classes: string[], fixes: string[], elements: string[], skips: string[] }?}
 */

let data = null;

/**
 * @description Shortcut to send messages to background script
 */

const dispatch = chrome.runtime.sendMessage;

/**
 * @description Forbidden tags to ignore in the DOM
 */

const forbiddenTags = ['BASE', 'BODY', 'HEAD', 'HTML', 'LINK', 'META', 'SCRIPT', 'STYLE', 'TITLE'];

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
 * @description Matches if node element is removable
 * @param {Element} node
 * @returns {boolean}
 */

const match = (node) =>
  node instanceof HTMLElement &&
  node.parentElement &&
  !forbiddenTags.includes(node.tagName?.toUpperCase?.()) &&
  node.matches(data?.elements ?? []);

/**
 * @description Cleans DOM
 * @param {HTMLElement[]} nodes
 * @param {boolean?} skipMatch
 * @returns {void}
 */

const clean = (nodes, skipMatch) =>
  nodes.filter((node) => skipMatch || match(node)).forEach((node) => node.remove());

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
 * @description Fixes bfcache issues
 * @listens window#pageshow
 */

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    dispatch({ hostname, type: 'GET_STATE' }, null, (state) => {
      if (data?.elements.length && state?.enabled && !preview) {
        fix();
        clean(Array.from(document.querySelectorAll(data.elements)), true);
      }
    });
  }
});

/**
 * @description Sets up everything
 */

dispatch({ hostname, type: 'GET_STATE' }, null, (state) => {
  dispatch({ type: 'ENABLE_POPUP' });

  if (state?.enabled) {
    dispatch({ hostname, type: 'GET_DATA' }, null, (result) => {
      data = result;
      observer.observe(document.body ?? document.documentElement, options);
      dispatch({ type: 'ENABLE_ICON' });
    });
  }
});
