'use strict';

if (!!window.chrome && navigator.vendor.includes("Google")) {
  // Get document head
  const head = document.head || document.getElementsByTagName('head')[0];

  // Create logic script
  const script = document.createElement("script");
  script.setAttribute("src", chrome.runtime.getURL("modules/script.js"));
  script.setAttribute("type", "module");

  // Inject logic  script
  head.appendChild(script);
};