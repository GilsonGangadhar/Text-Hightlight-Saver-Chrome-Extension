// Initialize popup when it's opened
document.addEventListener("DOMContentLoaded", () => {
  loadHighlights();
});

// Load all highlights from storage
function loadHighlights() {
  chrome.runtime.sendMessage({ type: "getHighlights" }, (response) => {
    const highlightsContainer = document.getElementById("highlights-container");
    const emptyState = document.getElementById("empty-state");
    const countElement = document.getElementById("highlight-count");

    if (response && response.highlights && response.highlights.length > 0) {
      emptyState.style.display = "none";
      highlightPopupInjector(response.highlights);
      countElement.textContent = `${response.highlights.length} saved`;
    } else {
      emptyState.style.display = "block";
      highlightsContainer.innerHTML = "";
      countElement.textContent = "0 saved";
    }
  });
}

// Render all highlights in the container
function highlightPopupInjector(highlights) {
  const container = document.getElementById("highlights-container");
  container.innerHTML = "";

  highlights.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  highlights.forEach((highlight) => {
    const highlightElement = createHighlightElement(highlight);
    container.appendChild(highlightElement);
  });
}

// Creating highlight card
function createHighlightElement(highlight) {
  const element = document.createElement("div");
  element.className = "highlight-item";
  element.dataset.id = highlight.id;

  const date = new Date(highlight.timestamp);
  const formattedDate = date.toLocaleString();

  element.innerHTML = `
      <div class="highlight-text">${highlight.text}</div>
      <div class="highlight-source">${highlight.title}</div>
      <div class="highlight-time">${formattedDate}</div>
      <div class="highlight-actions">
        <button class="summarize-btn">Summarize</button>
        <button class="delete-btn">Delete</button>
      </div>
    `;

  const deleteBtn = element.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", () => {
    deleteHighlight(highlight.id);
  });

  const summarizeBtn = element.querySelector(".summarize-btn");
  summarizeBtn.addEventListener("click", () => {
    summarizeHighlight(element, highlight.text);
  });

  return element;
}

// Deleting a highlight
function deleteHighlight(id) {
  const highlightElement = document.querySelector(
    `.highlight-item[data-id="${id}"]`
  );
  if (!highlightElement) return;

  // Show deletion in progress
  const deleteBtn = highlightElement.querySelector(".delete-btn");
  deleteBtn.textContent = "Deleting...";
  deleteBtn.disabled = true;

  chrome.runtime.sendMessage(
    { type: "deleteHighlight", id: id },
    (response) => {
      if (response && response.success) {
        highlightElement.remove();

        // Get fresh data from storage to ensure accurate count
        chrome.runtime.sendMessage({ type: "getHighlights" }, (data) => {
          const highlightsContainer = document.getElementById(
            "highlights-container"
          );
          const emptyState = document.getElementById("empty-state");
          const countElement = document.getElementById("highlight-count");

          // Update count based on actual storage data
          const highlights = data.highlights || [];
          countElement.textContent = `${highlights.length} saved`;

          if (highlights.length === 0) {
            emptyState.style.display = "block";
            emptyState.textContent =
              "No highlights saved yet. Select text on the webpage";
          } else {
            emptyState.style.display = "none";
          }
        });
      } else {
        // Restore the button if deletion failed
        deleteBtn.textContent = "Delete";
        deleteBtn.disabled = false;

        alert("Failed to delete highlight. Please try again.");
      }
    }
  );
}

// stimulating a dummy OpenAPI call
function summarizeHighlight(element) {
  const summarizeBtn = element.querySelector(".summarize-btn");
  summarizeBtn.textContent = "Summarizing...";
  summarizeBtn.disabled = true;

  // Remove existing summary if there is one
  const existingSummary = element.querySelector(".summary-section");
  if (existingSummary) {
    existingSummary.remove();
  }

  setTimeout(() => {
    const summaryText = "This is a simulated summary by openAI";

    const summaryElement = document.createElement("div");
    summaryElement.className = "summary-section";
    summaryElement.textContent = summaryText;

    element.appendChild(summaryElement);

    summarizeBtn.textContent = "Summarize";
    summarizeBtn.disabled = false;
  }, 1000);
}
