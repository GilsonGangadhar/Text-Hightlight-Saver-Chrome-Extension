let selectionPopup = null;
let currentSelection = "";
let currentUrl = "";

// Create selection popup if it doesn't exist
function createSelectionPopup() {
  if (selectionPopup) return;

  selectionPopup = document.createElement("div");
  selectionPopup.id = "highlight-saver-popup";
  selectionPopup.classList.add("highlight-saver-popup");

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save Selection";
  saveButton.addEventListener("click", saveHighlight);

  selectionPopup.appendChild(saveButton);
  document.body.appendChild(selectionPopup);
}

// position near selected textArea
function showPopup(x, y) {
  if (!selectionPopup) createSelectionPopup();

  selectionPopup.style.left = `${x}px`;
  selectionPopup.style.top = `${y}px`;
  selectionPopup.style.display = "block";
}

// Hide the popup
function hidePopup() {
  if (selectionPopup) {
    selectionPopup.style.display = "none";
  }
}

// Save the current highlight
function saveHighlight() {
  if (!currentSelection) return;

  const highlight = {
    text: currentSelection,
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString(),
    id: Date.now().toString(),
  };

  chrome.storage.local.get({ highlights: [] }, (data) => {
    const highlights = data.highlights;
    highlights.push(highlight);
    chrome.storage.local.set({ highlights: highlights }, () => {
      // console.log("Highlight saved, highlight");
      hidePopup();
    });
  });
}

// Handle text selection
document.addEventListener("mouseup", (e) => {
  const selection = window.getSelection();
  currentSelection = selection.toString().trim();

  if (currentSelection) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const x = rect.left + window.scrollX + rect.width / 2;
    const y = rect.bottom + window.scrollY;

    showPopup(x, y);
  } else {
    hidePopup();
  }
});

// Hide popup when clicking elsewhere
document.addEventListener("mousedown", (e) => {
  if (selectionPopup && !selectionPopup.contains(e.target)) {
    hidePopup();
  }
});
