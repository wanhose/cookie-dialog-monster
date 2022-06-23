import { disableIcon, enableIcon, enablePopup } from '~core/action';
import { reportSite } from '~core/api';
import { getOptions } from '~core/storage';
import { getCurrentTab } from '~core/tabs';

import type { BackgroundMessage } from './types';
import { checkElements, getData, GetDataResult } from './utils';

let cache: GetDataResult | undefined = undefined;
const contextMenuId = 'CDM_RO';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    contexts: ['all'],
    documentUrlPatterns: chrome.runtime.getManifest().content_scripts?.[0].matches,
    id: contextMenuId,
    title: chrome.i18n.getMessage('contextMenuText'),
  });

  chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId !== contextMenuId) return;
    reportSite();
  });
});

chrome.runtime.onMessage.addListener(async (message: BackgroundMessage, sender, callback) => {
  const tabId = sender.tab?.id;

  switch (message.type) {
    case 'CHECK_ELEMENTS':
      await checkElements({ nodes: message.elements, selectors: cache?.selectors ?? [] });
      break;
    case 'DISABLE_ICON':
      if (tabId) disableIcon(tabId);
      break;
    case 'ENABLE_ICON':
      if (tabId) enableIcon(tabId);
      break;
    case 'ENABLE_POPUP':
      if (tabId) enablePopup(tabId);
      break;
    case 'GET_DATA':
      const data = cache ?? (await getData());
      if (!cache) cache = data;
      callback(data);
      break;
    case 'GET_CURRENT_TAB':
      callback(await getCurrentTab());
      break;
    case 'GET_OPTIONS':
      if (message.hostname) callback(getOptions({ hostname: message.hostname }));
      break;
    default:
      break;
  }

  return true;
});
