// content.js - Inbox Scanner Mode
console.log("PhishGuard: Monitoring Inbox...");

// This function processes each email row
async function processInboxRows() {
    // Select all email rows in Gmail
    const emailRows = document.querySelectorAll("tr.zA");

    for (let row of emailRows) {
        // Prevent double-scanning
        if (row.getAttribute('data-phish-scanned')) continue;
        row.setAttribute('data-phish-scanned', 'true');

        // Extract Snippet and Sender Name from the row
        const sender = row.querySelector(".yP, .zF")?.innerText || "Unknown";
        const snippet = row.querySelector(".y2")?.innerText || "";

        // Create a visual badge in the Gmail row
        const badge = document.createElement("span");
        badge.innerText = " [Scanning...] ";
        badge.style = "margin-left: 10px; font-weight: bold; font-size: 11px; color: #666;";
        row.querySelector(".yX")?.appendChild(badge);

        // Send to Backend
        try {
            const response = await fetch("http://127.0.0.1:5000/api/classify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sender_email: sender, text: snippet })
            });
            const data = await response.json();
            
            // Update the badge based on AI result
            applySecurityStyle(badge, data.label);
        } catch (err) {
            badge.innerText = " [Offline] ";
        }
    }
}

function applySecurityStyle(badge, label) {
    badge.innerText = ` [${label.toUpperCase()}] `;
    badge.style.borderRadius = "3px";
    badge.style.padding = "1px 4px";
    badge.style.color = "white";

    if (label === "phishing") {
        badge.style.backgroundColor = "#d93025"; // Red
    } else if (label === "suspicious") {
        badge.style.backgroundColor = "#f29900"; // Orange
    } else {
        badge.style.backgroundColor = "#188038"; // Green
    }
}

// Run scanner whenever the user scrolls or Gmail updates the list
const observer = new MutationObserver(processInboxRows);
observer.observe(document.body, { childList: true, subtree: true });

// Initial scan
processInboxRows();