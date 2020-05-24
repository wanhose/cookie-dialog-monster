'use strict';

if (!!window.chrome && navigator.vendor.includes("Google")) {
  const head = document.head || document.getElementsByTagName('head')[0];
  const runtime = browser.runtime || chrome.runtime;
  
  // Create logic script
  const script = document.createElement("script");
  script.setAttribute("src", runtime.getURL("js/modules/script.js"));
  script.setAttribute("type", "module");

  // Inject logic script
  head.appendChild(script);
};