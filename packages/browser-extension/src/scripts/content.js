/**
 * @description Data properties
 * @type {{ actions: { where: string[], selectors: string[], actions: { name: string[], params: string[][]? }[] }[], tokens: { where: string[], selectors: string[] }[] }?}
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
 * @description Access object using dot notation
 * @param {{ [key: string]: any }} target
 * @param {string} path
 * @returns {any}
 */

const access = (target, path) => path.split('.').reduce((acc, curr) => acc[curr], target);

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
      runActions();
      clean(nodes, true);
      elementCount += nodes.length;
    }
  }
};

/**
 * @description Checks if an action can run in the current site
 * @param {string} site
 * @returns {boolean}
 */

const isInSite = (site) => {
  const regExp = new RegExp(site.replace('*', '.*'));

  if (site === '*') {
    return true;
  }

  if (site.startsWith('!')) {
    return !regExp.test(site.substring(1));
  }

  return regExp.test(site);
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

    if (
      !data?.tags.includes(node.tagName?.toUpperCase?.()) &&
      (skipIsInViewport || isInViewport(node)) &&
      (!!node.offsetParent || style.position === 'fixed') &&
      !!node.parentElement
    ) {
      console.log('Cookie Dialog Monster: ', node);
    }

    return (
      !data?.tags.includes(node.tagName?.toUpperCase?.()) &&
      (skipIsInViewport || isInViewport(node)) &&
      (!!node.offsetParent || style.position === 'fixed') &&
      !!node.parentElement &&
      (skipMatch ||
        data?.tokens?.some(
          (token) => token.where.some(isInSite) && node.matches(token.selectors ?? [])
        ))
    );
  }

  return false;
};

/**
 * @description Executes data actions (fixes)
 */

const runActions = () => {
  const backdrop = document.getElementsByClassName('modal-backdrop')[0];

  if (backdrop?.children.length === 0) {
    backdrop.remove();
  }

  if (data?.tokens?.some((token) => token.where.some(isInSite))) {
    dispatch({ type: 'INSERT_CONTENT_CSS' });
  }

  for (const action of data?.actions ?? []) {
    if (action.where.every(isInSite)) {
      const nodes = [...document.querySelectorAll(action.selectors)];

      for (const { name, params } of action.actions) {
        for (const node of nodes) {
          access(node, name)?.(...(params ?? []));
        }
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

  runActions();
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
    observer.observe(document.body ?? document.documentElement, options);
  }
})();
