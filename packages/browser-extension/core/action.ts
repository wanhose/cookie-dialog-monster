export function disableIcon(tabId: number) {
  chrome.action.setIcon({ path: '~assets/icons/disabled.png', tabId });
}

export function enableIcon(tabId: number) {
  chrome.action.setIcon({ path: '~assets/icons/enabled.png', tabId });
}

export function enablePopup(tabId: number) {
  chrome.action.setPopup({ popup: '~../popup.tsx', tabId });
}
