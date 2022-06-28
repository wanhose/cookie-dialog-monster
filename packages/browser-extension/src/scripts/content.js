/**
 * @description Array of selectors
 * @type {string[]}
 */

const classes = [];

/**
 * @description Shortcut to send messages to background script
 */

const dispatch = chrome.runtime.sendMessage;

/**
 * @description Array of instructions
 * @type {string[]}
 */

const fixes = [];

/**
 * @description Current hostname
 * @type {string}
 */

const hostname = document.location.hostname.split('.').slice(-2).join('.');

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
 * @description Selectors list
 * @type {string[]}
 */

const selectors = [];

/**
 * @description Array of skips to skip
 * @type {string[]}
 */

const skips = [];

/**
 * @description Checks if node element is removable
 * @param {any} node
 * @param {boolean} skipMatch
 * @returns {boolean}
 */

const check = (node, skipMatch) =>
  node instanceof HTMLElement &&
  node.parentElement &&
  !node.getAttribute('data-cookie-dialog-monster') &&
  !(node.id && ['APP', 'ROOT'].includes(node.id.toUpperCase?.())) &&
  node.outerHTML.match(/banner|cmp|consent|cookie|gdpr|modal|overlay|popup|privacy/gi) &&
  (skipMatch || node.matches(selectors));

/**
 * @description Cleans DOM
 * @param {HTMLElement[]} nodes
 * @returns {void}
 */

const clean = (nodes, skipMatch) =>
  nodes
    .filter((node) => check(node, skipMatch))
    .forEach((node) => {
      node.setAttribute('data-cookie-dialog-monster', 'true');
      node.remove();
    });

/**
 * @description Fixes scroll issues
 */

const fix = () => {
  document.getElementsByClassName('_31e')[0]?.classList.remove('_31e');

  if (skips.length && !skips.includes(hostname)) {
    for (const item of [document.body, document.documentElement]) {
      item?.classList.remove(...classes);
      item?.style.setProperty('position', 'initial', 'important');
      item?.style.setProperty('overflow-y', 'initial', 'important');
    }
  }

  for (const fix of fixes) {
    const [match, selector, action, property] = fix.split('##');

    if (hostname.includes(match)) {
      switch (action) {
        case 'click': {
          const node = document.querySelector(selector);
          node?.click();
          break;
        }
        case 'hide': {
          const node = document.querySelector(selector);
          node?.style?.setProperty('display', 'none', 'important');
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
  if (!preview && selectors.length) clean(nodes);
});

/**
 * @description Fix bfcache issues
 * @listens window#DOMContentLoaded
 */

window.addEventListener('DOMContentLoaded', async () => {
  let data = await dispatch({ type: 'GET_DATA' });
  const state = await dispatch({ hostname, type: 'GET_STATE' });

  if (data && state?.enabled) {
    const nodes = [...document.querySelectorAll(data.elements)];
    clean(nodes, true);
    dispatch({ type: 'ENABLE_ICON' });
  } else if (!data) {
    await dispatch({ type: 'REFRESH_DATA' });
    data = await dispatch({ type: 'GET_DATA' });
  }

  dispatch({ type: 'ENABLE_POPUP' });
  classes.push(...(data?.classes ?? []));
  fixes.push(...(data?.fixes ?? []));
  selectors.push(...(data?.elements ?? []));
  skips.push(...(data?.skips ?? []));
  observer.observe(document.body, options);
});

/**
 * @description Fix bfcache issues
 * @listens window#unload
 */

window.addEventListener('unload', () => {});
