const handleClick = (event) => {
  const negative = document.getElementById("negative");
  const positive = document.getElementById("positive");
  const { score } = event.currentTarget.dataset;
  const stars = document.getElementById("stars");

  switch (score) {
    case "1":
    case "2":
    case "3":
      stars.setAttribute("hidden", "true");
      negative.removeAttribute("hidden");
      break;
    case "4":
    case "5":
      stars.setAttribute("hidden", "true");
      positive.removeAttribute("hidden");
      break;
    default:
      break;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const chromeUrl =
    "https://chrome.google.com/webstore/detail/do-not-consent/djcbfpkdhdkaflcigibkbpboflaplabg";
  const firefoxUrl =
    "https://addons.mozilla.org/es/firefox/addon/do-not-consent/";
  const isChrome = chrome.runtime.getURL("").startsWith("chrome-extension://");
  const stars = Array.from(document.getElementsByClassName("star"));
  const storeLink = document.getElementById("store-link");

  stars.forEach((star) => {
    star.addEventListener("click", handleClick);
  });
  storeLink.setAttribute("href", isChrome ? chromeUrl : firefoxUrl);
});
