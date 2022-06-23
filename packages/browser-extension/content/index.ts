import type { PlasmoContentScript } from 'plasmo';

import type { GetDataResult } from '~background/utils';
import type { Options } from '~core/storage';

import type { ContentMessage } from './types';
import { backgroundRequest, cleanDom, fixDom } from './utils';

export const config: PlasmoContentScript = {
  matches: ['http://*/*', 'https://*/*'],
  run_at: 'document_start',
};

chrome.runtime.onMessage.addListener((message: ContentMessage) => {
  for (const selector of message.selectors) cleanDom({ selector });
});

window.addEventListener('load', async () => {
  const classes: string[] = [];
  const fixes: string[] = [];
  const hostname = document.location.hostname.split('.').slice(-2).join('.');
  const observerOptions: MutationObserverInit = { childList: true, subtree: true };
  const preview = hostname.startsWith('consent.') || hostname.startsWith('myprivacy.');
  const selectors: string[] = [];
  const skips: string[] = [];
  const target = document.body || document.documentElement;

  const observer = new MutationObserver(async (mutations, instance) => {
    const nodes = mutations.map((mutation) => Array.from(mutation.addedNodes)).flat();
    const elements = nodes.flatMap((node) => (node instanceof HTMLElement ? [node.outerHTML] : []));

    instance.disconnect();
    fixDom({ classes, fixes, hostname, skips });
    if (!preview) backgroundRequest({ elements, type: 'CHECK_ELEMENTS' });
    instance.observe(target, observerOptions);
  });

  const [options] = await Promise.all([
    backgroundRequest<Options>({ hostname, type: 'GET_OPTIONS' }),
    backgroundRequest({ type: 'ENABLE_POPUP' }),
  ]);

  if (options.enabled) {
    const data = await backgroundRequest<GetDataResult>({ type: 'GET_DATA' });

    classes.push(...data.classes);
    fixes.push(...data.fixes);
    observerOptions.attributeFilter = data.attributes;
    selectors.push(...data.selectors);
    skips.push(...data.skips);
    observer.observe(target, observerOptions);
    await backgroundRequest({ type: 'ENABLE_ICON' });
  }
});

// eslint-disable-next-line
window.addEventListener('unload', () => {});
