export async function getCurrentTab(): Promise<{ hostname?: string; id?: number; url?: string }> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab: chrome.tabs.Tab | undefined = tabs[0];

  return {
    hostname: tab.url ? new URL(tab.url).hostname.split('.').slice(-2).join('.') : undefined,
    id: tab?.id,
    url: tab?.url,
  };
}

export async function refreshTab(): Promise<void> {
  await chrome.tabs.reload({ bypassCache: true });
}
