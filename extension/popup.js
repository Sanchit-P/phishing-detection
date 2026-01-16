document.addEventListener('DOMContentLoaded', function() {
    // 1. Initial Load of Counts when popup opens
    updateLiveCounts();

    // 2. Optional: Set an interval to refresh counts while popup is open
    // (Helpful if Gmail is still scanning in the background)
    const refreshInterval = setInterval(updateLiveCounts, 1000);

    // Clean up interval when popup closes
    window.addEventListener('unload', () => clearInterval(refreshInterval));
});

function updateLiveCounts() {
    // 1. Find the active Gmail tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
            // 2. Send message to content.js to get the count of badges on screen
            chrome.tabs.sendMessage(tabs[0].id, { action: "GET_COUNTS" }, (response) => {
                if (chrome.runtime.lastError) {
                    // Silently fail if not on a valid Gmail page
                    return;
                }

                if (response) {
                    // 3. Update the UI Counters
                    const phishElem = document.getElementById('cnt-phishing');
                    const suspElem = document.getElementById('cnt-suspicious');
                    const safeElem = document.getElementById('cnt-safe');

                    if (phishElem) phishElem.innerText = response.phishing || 0;
                    if (suspElem) suspElem.innerText = response.suspicious || 0;
                    if (safeElem) safeElem.innerText = response.safe || 0;
                }
            });
        }
    });
}