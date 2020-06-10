'use strict';

if (!!window.chrome) {
  const target = 
    document.head 
    || document.getElementsByTagName('head')[0]
    || document.body
    || document.getElementsByTagName('body')[0];
  
  // Create logic script
  const script = document.createElement("script");
  script.setAttribute("src", chrome.runtime.getURL("js/modules/script.js"));
  script.setAttribute("type", "module");

  // Inject logic script
  target.appendChild(script);
};

