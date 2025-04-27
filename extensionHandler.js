// Initialize when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({ highlights: [] }, (data) => {
    if (!data.highlights) {
      chrome.storage.local.set({ highlights: [] });
    }
  });
});

// Listen for messages from texthighlighter and highlightPopup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getHighlights") {
    chrome.storage.local.get({ highlights: [] }, (data) => {
      sendResponse({ highlights: data.highlights });
    });
    return true;
  }

  if (message.type === "deleteHighlight") {
    chrome.storage.local.get({ highlights: [] }, (data) => {
      const filteredHighlights = data.highlights.filter(
        (highlight) => highlight.id !== message.id
      );
      chrome.storage.local.set({ highlights: filteredHighlights }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
});
