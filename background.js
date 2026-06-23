// Mismo mecanismo que funcionaba (insertCSS), pero con persistencia:
// - El estado vive en chrome.storage.sync (sobrevive a cierres/cambios de página).
// - Se REAPLICA en cada navegación vía tabs.onUpdated.

const CSS = `::selection {
  background: rgba(248, 248, 248, 0.49);
  color: inherit;
}`;

async function applyToTab(tabId) {
  try {
    await chrome.scripting.insertCSS({ target: { tabId }, css: CSS });
  } catch (_) {
    // Pestañas internas (chrome://, store, etc.) no permiten inyección. Se ignora.
  }
}

async function removeFromTab(tabId) {
  try {
    await chrome.scripting.removeCSS({ target: { tabId }, css: CSS });
  } catch (_) {}
}

// El botón alterna el estado y lo refleja al instante en la pestaña actual.
chrome.action.onClicked.addListener(async (tab) => {
  const { enabled = false } = await chrome.storage.sync.get("enabled");
  const next = !enabled;
  await chrome.storage.sync.set({ enabled: next });
  if (tab.id != null) {
    next ? applyToTab(tab.id) : removeFromTab(tab.id);
  }
});

// Clave del fix: reaplicar el estilo cada vez que una página carga.
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status !== "complete") return;
  const { enabled = false } = await chrome.storage.sync.get("enabled");
  if (enabled) applyToTab(tabId);
});
