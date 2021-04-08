/**
 * @function disableIcon
 * @description Disables icon
 *
 * @param {string} [tabId]
 */

const disableIcon = (tabId) => {
  chrome.browserAction.setIcon({
    path: "assets/icon-disabled.png",
    tabId: tabId,
  });
};

/**
 * @function disablePopup
 * @description Disables popup
 *
 * @param {string} [tabId]
 */

const disablePopup = (tabId) => {
  chrome.browserAction.setPopup({
    popup: "",
    tabId: tabId,
  });
};

/**
 * @function enableIcon
 * @description Enables icon
 *
 * @param {string} [tabId]
 */

const enableIcon = (tabId) => {
  chrome.browserAction.setIcon({
    path: "assets/icon-enabled.png",
    tabId: tabId,
  });
};

/**
 * @function enablePopup
 * @description Enables popup
 *
 * @param {string} [tabId]
 */

const enablePopup = (tabId) => {
  chrome.browserAction.setPopup({
    popup: "popup.html",
    tabId: tabId,
  });
};

/**
 * @description Listens to content messages
 */

chrome.runtime.onMessage.addListener((request, sender) => {
  sender.tab = { id: undefined };

  switch (request.type) {
    case "DISABLE_ICON":
      disableIcon(sender.tab.id);
      break;
    case "DISABLE_POPUP":
      disablePopup(sender.tab.id);
      break;
    case "ENABLE_ICON":
      enableIcon(sender.tab.id);
      break;
    case "ENABLE_POPUP":
      enablePopup(sender.tab.id);
      break;
    default:
      break;
  }
});
