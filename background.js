const supportedUrls = [
  'https://chatgpt.com/*',
  'https://chat.openai.com/*',
  'https://gemini.google.com/*',
];

async function injectIntoOpenSupportedTabs() {
  const tabs = await chrome.tabs.query({ url: supportedUrls });
  await Promise.allSettled(tabs.map(async ({ id }) => {
    if (typeof id !== 'number') return;
    await chrome.scripting.executeScript({
      target: { tabId: id },
      files: ['content.js'],
    });
  }));
}

chrome.runtime.onInstalled.addListener(() => {
  void injectIntoOpenSupportedTabs();
});

chrome.runtime.onStartup.addListener(() => {
  void injectIntoOpenSupportedTabs();
});
