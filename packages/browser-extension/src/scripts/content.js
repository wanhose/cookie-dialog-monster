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

const hostname = getHostname();

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
 * @returns {void}
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
 * @returns {void}
 */

function forceClean(element) {
  const elements = [...element.querySelectorAll(data.elements)];

  fix();
  if (elements.length && !preview) clean(elements, true);
}

/**
 * @description Forces element to have these styles
 * @param {HTMLElement} element
 * @returns {void}
 */

function forceElementStyles(element) {
  element.style.setProperty('display', 'none', 'important');
}

/**
 * @description Calculates current hostname
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
  if (!(element instanceof HTMLElement) || !element.tagName) {
    return false;
  }

  if (element.getAttribute('data-cookie-dialog-monster')) {
    return false;
  }

  if (!data?.tags?.length || data.tags.includes(element.tagName?.toUpperCase?.())) {
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
 * @description Fixes data, consent page and scroll issues
 * @returns {void}
 */

function fix() {
  const backdrop = document.getElementsByClassName('modal-backdrop')[0];
  const facebook = document.getElementsByClassName('_31e')[0];
  const fixes = data?.fixes ?? [];
  const skips = (data?.skips ?? []).map((x) => (x.split('.').length < 3 ? `*${x}` : x));

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

  if (skips.every((x) => !hostname.match(x.replace(/\*/g, '[^ ]*')))) {
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
 * @async
 * @description Sets up everything
 * @param {boolean} skipReadyStateHack
 */

async function runSetup(skipReadyStateHack) {
  state = (await dispatch({ hostname, type: 'GET_HOSTNAME_STATE' })) ?? state;
  dispatch({ type: 'ENABLE_POPUP' });

  if (state.enabled) {
    data = await dispatch({ hostname, type: 'GET_DATA' });

    // 2023-06-13: hack to force clean when data request takes too long and there are no changes later
    if (document.readyState === 'complete' && !skipReadyStateHack) {
      window.dispatchEvent(new Event('run'));
    }

    dispatch({ type: 'ENABLE_ICON' });
    observer.observe(document.body ?? document.documentElement, options);
  }
}

/**
 * @description Mutation Observer instance
 * @type {MutationObserver}
 */

const observer = new MutationObserver((mutations) => {
  const elements = mutations.map((mutation) => Array.from(mutation.addedNodes)).flat();

  fix();
  if (data?.elements.length && !preview) clean(elements);
});

/**
 * @async
 * @description Runs setup if the page wasn't focused yet
 * @listens window#focus
 * @returns {void}
 */

window.addEventListener('focus', async () => {
  if (!data) {
    await runSetup(true);
    clean([...document.body.children]);
  }
});

/**
 * @description Fixes still existing elements when page fully load
 * @listens window#load
 * @returns {void}
 */

window.addEventListener('load', () => {
  if (document.hasFocus()) {
    window.dispatchEvent(new Event('run'));
  }
});

/**
 * @description Fixes bfcache issues
 * @listens window#pageshow
 * @returns {void}
 */

window.addEventListener('pageshow', (event) => {
  if (document.hasFocus() && event.persisted) {
    window.dispatchEvent(new Event('run'));
  }
});

/**
 * @description Forces a clean when this event is fired
 * @listens window#run
 * @returns {void}
 */

window.addEventListener('run', () => {
  if (data?.elements.length && document.body && state.enabled && !preview) {
    if (readingTime() < 4) {
      forceClean(document.body);
    } else {
      // 2023-06-13: look into the first level of the document body, there are dialogs there very often
      clean([...document.body.children]);
    }
  }
});

/**
 * @description As this extension do really expensive work, it only runs if the user is on the page
 */

if (document.hasFocus()) {
  runSetup();
}
