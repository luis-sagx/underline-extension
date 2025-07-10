chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    css: `::selection {
      background: rgba(248, 248, 248, 0.49);
      color: inherit;
    }`
  });
});
