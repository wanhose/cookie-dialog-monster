let elements = [];

const fix = () => {
  const html = document.documentElement;
  const body = document.body;

  html.style.setProperty("overflow-y", "unset", "important");
  body.style.setProperty("overflow-y", "unset", "important");
};

const retrieveElement = (match) => {
  if (!match.includes("[") && !match.includes(">")) {
    if (match.startsWith(".")) {
      return document.getElementsByClassName(match.slice(1))[0];
    }

    if (match.startsWith("#")) {
      return document.getElementById(match.slice(1));
    }
  } else {
    return document.querySelector(match);
  }

  return null;
};

const observe = () => {
  observer.observe(document.body, {
    attributes: true,
    childList: true,
  });
};

const remove = () => {
  for (let i = elements.length; i--; ) {
    const match = elements[i];
    const element = retrieveElement(match);
    const tagName = element ? element.tagName.toUpperCase() : "";

    if (element && !["BODY", "HTML"].includes(tagName)) {
      element.remove();
    }
  }
};

const observer = new MutationObserver((_, instance) => {
  instance.disconnect();
  fix();
  remove();
  observe();
});

(async () => {
  const url = chrome.runtime.getURL("elements/index.txt");
  const db = await fetch(url).then((res) => res.text());
  elements = db.split("\n");

  document.addEventListener("DOMContentLoaded", () => {
    fix();
    remove();
    observe();
  });
})();
