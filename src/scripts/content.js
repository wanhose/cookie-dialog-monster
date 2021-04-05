let elements = [];

const fix = () => {
  const html = document.documentElement;
  const body = document.body;

  html.style.setProperty("overflow-y", "unset", "important");
  body.style.setProperty("overflow-y", "unset", "important");
};

const observe = () => {
  observer.observe(document.body, {
    attributes: true,
    childList: true,
  });
};

const search = (match) => {
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

const remove = () => {
  for (let i = elements.length; i--; ) {
    const match = elements[i];
    const element = search(match);

    if (element) {
      const tagName = element.tagName.toUpperCase();

      if (!["BODY", "HTML"].includes(tagName)) element.remove();
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
  const url = chrome.runtime.getURL("data/elements.txt");
  const db = await fetch(url).then((res) => res.text());
  elements = db.split("\n");
})();

document.addEventListener("DOMContentLoaded", () => {
  fix();
  remove();
  observe();
});
