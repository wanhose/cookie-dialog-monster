import runtime from './runtime';
import { getCurrentTab } from './tabs';

export async function reportSite() {
  const tab = await getCurrentTab();
  const userAgent = window.navigator.userAgent;
  const version = chrome.runtime.getManifest().version;

  await fetch(`${runtime.apiUrl}/report/`, {
    body: JSON.stringify({
      html: `<b>Browser:</b> ${userAgent}<br/><b>Site:</b> ${tab.url}<br/><b>Version:</b> ${version}`,
      to: 'hello@wanhose.dev',
      subject: 'Cookie Dialog Monster Report',
    }),
    headers: {
      'Content-type': 'application/json',
    },
    method: 'POST',
  });
}
