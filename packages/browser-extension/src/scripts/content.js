/**
 * @description Data properties
 * @type {{ classes: string[], commonWords?: string[], fixes: string[], elements: string[], skips: string[], tags: string[] }?}
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
 * @description Extension state
 * @type {{ enabled: boolean }}
 */

let state = { enabled: true };

/**
 * @description Cleans DOM
 * @param {Element[]} nodes
 * @param {boolean?} skipMatch
 */

function clean(nodes, skipMatch) {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (match(node, skipMatch)) {
      const observer = new MutationObserver(() => {
        node.style.setProperty('display', 'none', 'important');
      });

      if (!node.hasAttribute('data-cookie-dialog-monster')) {
        node.setAttribute('data-cookie-dialog-monster', 'true');
        node.style.setProperty('display', 'none', 'important');
        observer.observe(node, { attributes: true, attributeFilter: ['style'] });
      }
    }
  }
}

/**
 * @description Flat child nodes
 * @param {HTMLElement} node
 * @param {HTMLElement[] | undefined} children
 * @returns {number[]}
 */

function flatNode(node) {
  return [...node.childNodes].flatMap((childNode) =>
    childNode.nodeType === Node.TEXT_NODE
      ? [childNode.nodeType]
      : [...[...childNode.childNodes].map((x) => x.nodeType)]
  );
}

/**
 * @description Forces a DOM clean in the specific node
 * @param {HTMLElement} node
 */

function forceClean(node) {
  if (data?.elements.length && state.enabled && !preview) {
    const nodes = [...node.querySelectorAll(data.elements)];

    if (nodes.length) {
      fix();
      clean(nodes, true);
    }
  }
}

/**
 * @description Checks if an element is visible in the viewport
 * @param {HTMLElement} node
 * @returns {boolean}
 */

function isInViewport(node) {
  const height = window.innerHeight || document.documentElement.clientHeight;
  const position = node.getBoundingClientRect();
  const scroll = window.scrollY;

  return (
    position.bottom === position.top ||
    (scroll + position.top <= scroll + height && scroll + position.bottom >= scroll)
  );
}

/**
 * @description Checks if node element is removable
 * @param {Element} node
 * @param {boolean?} skipMatch
 * @returns {boolean}
 */

function match(node, skipMatch) {
  if (!node instanceof HTMLElement) {
    return false;
  }

  if (data?.tags.includes(node.tagName?.toUpperCase?.())) {
    return false;
  }

  if (flatNode(node).every((x) => x === Node.TEXT_NODE)) {
    return false;
  }

  if (node.hasAttributes()) {
    return (
      // 2023-06-10: twitch.tv temporary fix
      !node.classList.contains('chat-line__message') &&
      // ...
      !node.getAttribute('data-cookie-dialog-monster') &&
      isInViewport(node) &&
      (skipMatch || node.matches(data?.elements ?? []))
    );
  } else {
    // 2023-06-10: fix edge case force cleaning on children if no attributes
    if (data?.commonWords && node.outerHTML.match(new RegExp(data.commonWords.join('|')))) {
      forceClean(node);
    }
  }

  return false;
}

/**
 * @description Fixes scroll issues
 */

function fix() {
  const backdrop = document.getElementsByClassName('modal-backdrop')[0];
  const facebook = document.getElementsByClassName('_31e')[0];
  const fixes = data?.fixes ?? [];
  const skips = data?.skips ?? [];

  if (backdrop?.children.length === 0) {
    backdrop.remove();
  }

  facebook?.classList.remove('_31e');

  for (const fix of fixes) {
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

  if (skips.indexOf(hostname) === -1) {
    for (const item of [document.body, document.documentElement]) {
      item?.classList.remove(...(data?.classes ?? []));
      item?.style.setProperty('position', 'initial', 'important');
      item?.style.setProperty('overflow-y', 'initial', 'important');
    }
  }
}

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
    forceClean(document.documentElement);
  }
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
    observer.observe(document.documentElement, options);
  }
})();
