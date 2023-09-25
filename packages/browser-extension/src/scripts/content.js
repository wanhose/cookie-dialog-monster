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
 * @param {Element[]} elements
 * @param {boolean?} skipMatch
 */

function clean(elements, skipMatch) {
  for (const element of elements) {
    if (match(element, skipMatch)) {
      const observer = new MutationObserver(() => forceElementStyles(element));

      element.setAttribute('data-cookie-dialog-monster', 'true');
      element.style.setProperty('display', 'none', 'important');
      observer.observe(element, { attributes: true, attributeFilter: ['class', 'style'] });
    }
  }
}

/**
 * @description Forces a DOM clean in the specific element
 * @param {HTMLElement} element
 */

function forceClean(element) {
  const elements = [...element.querySelectorAll(data.elements)];

  if (elements.length) {
    fix();
    clean(elements, true);
  }
}

/**
 * @description Forces element to have these styles
 * @param {HTMLElement} element
 */

function forceElementStyles(element) {
  element.style.setProperty('display', 'none', 'important');
}

/**
 * @description Checks if an element is visible in the viewport
 * @param {HTMLElement} element
 * @returns {boolean}
 */

function isInViewport(element) {
  const height = window.innerHeight || document.documentElement.clientHeight;
  const position = element.getBoundingClientRect();
  const scroll = window.scrollY;

  return (
    position.bottom === position.top ||
    (scroll + position.top <= scroll + height && scroll + position.bottom >= scroll)
  );
}

/**
 * @description Checks if element element is removable
 * @param {Element} element
 * @param {boolean?} skipMatch
 * @returns {boolean}
 */

function match(element, skipMatch) {
  if (!element instanceof HTMLElement || !element.tagName) {
    return false;
  }

  if (element.getAttribute('data-cookie-dialog-monster')) {
    return false;
  }

  if (data?.tags.includes(element.tagName?.toUpperCase?.())) {
    return false;
  }

  if (element.hasAttributes()) {
    return (
      // 2023-06-10: twitch.tv temporary fix
      !element.classList.contains('chat-line__message') &&
      // ...
      isInViewport(element) &&
      (skipMatch || element.matches(data?.elements ?? []))
    );
  } else {
    // 2023-06-10: fix edge case force cleaning on children if no attributes
    if (data?.commonWords && element.outerHTML.match(new RegExp(data.commonWords.join('|')))) {
      forceClean(element);
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
        case 'click':
          document.querySelector(selector)?.click();
          break;
        case 'remove':
          document.querySelector(selector)?.style?.removeProperty(property);
          break;
        case 'reset':
          document.querySelector(selector)?.style?.setProperty(property, 'initial', 'important');
          break;
        case 'resetAll':
          document.querySelectorAll(selector).forEach((element) => {
            element?.style?.setProperty(property, 'initial', 'important');
          });
          break;
        default:
          break;
      }
    }
  }

  if (skips.indexOf(hostname) === -1) {
    for (const element of [document.body, document.documentElement]) {
      element?.classList.remove(...(data?.classes ?? []));
      element?.style.setProperty('position', 'initial', 'important');
      element?.style.setProperty('overflow-y', 'initial', 'important');
    }
  }
}

/**
 * @description Calculates reading time for the current page to avoid lags in large pages
 * @returns {number}
 */

function readingTime() {
  const text = document.body.innerText;
  const wpm = 225;
  const words = text.trim().split(/\s+/).length;
  const time = Math.ceil(words / wpm);

  return time;
}

/**
 * @description Mutation Observer instance
 * @type {MutationObserver}
 */

const observer = new MutationObserver((mutations) => {
  const elements = mutations.map((mutation) => Array.from(mutation.addedNodes)).flat();

  if (data?.elements.length && !preview) {
    fix();
    clean(elements);
  }
});

/**
 * @description Fixes still existing elements when page fully load
 * @listens window#load
 */

window.addEventListener('load', () => {
  window.dispatchEvent(new Event('run'));
});

/**
 * @description Fixes bfcache issues
 * @listens window#pageshow
 */

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    window.dispatchEvent(new Event('run'));
  }
});

/**
 * @description Forces a clean when this event is fired
 * @listens window#run
 */

window.addEventListener('run', () => {
  if (data?.elements.length && state.enabled && !preview) {
    if (readingTime() < 4) {
      forceClean(document.body);
    } else {
      // 2023-06-13: look into the first level of the document body, there are dialogs there very often
      clean([...document.body.children]);
    }
  }
});

/**
 * @async
 * @description Sets up everything
 */

(async () => {
  state = (await dispatch({ hostname, type: 'GET_HOSTNAME_STATE' })) ?? state;
  dispatch({ type: 'ENABLE_POPUP' });

  if (state.enabled) {
    data = await dispatch({ hostname, type: 'GET_DATA' });

    // 2023-06-13: hack to force clean when data request takes too long and there are no changes later
    if (document.readyState === 'complete') {
      window.dispatchEvent(new Event('run'));
    }

    dispatch({ type: 'ENABLE_ICON' });
    observer.observe(document.body ?? document.documentElement, options);
  }
})();
