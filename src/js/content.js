'use strict';

if (!!window.chrome) {
  const head = document.head || document.getElementsByTagName('head')[0];
  
  // Create logic script
  const script = document.createElement("script");
  script.setAttribute("src", chrome.runtime.getURL("js/modules/script.js"));
  script.setAttribute("type", "module");

  // Inject logic script
  (head || document.body).appendChild(script);
};

