// content.js - Smart Scanner Mode with Unicode Support
console.log("WebGuardian: Monitoring Inbox with Persistence...");

// A Unicode-safe hashing function to create a unique ID for each email
function createFingerprint(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return `msg_${Math.abs(hash)}`;
}

async function processInboxRows() {
    const emailRows = document.querySelectorAll("tr.zA");

    for (let row of emailRows) {
        if (row.getAttribute('data-phish-scanned')) continue;
        row.setAttribute('data-phish-scanned', 'true');

        const sender = row.querySelector(".yP, .zF")?.innerText || "Unknown";
        const snippet = row.querySelector(".y2")?.innerText || "";
        
        // FIX: Use the safe fingerprint instead of btoa()
        const emailKey = createFingerprint(sender + snippet);

        const badge = document.createElement("span");
        badge.innerText = " [Scanning...] ";
        badge.className = "phish-badge"; // Clean style management
        badge.style = "margin-left: 10px; font-weight: bold; font-size: 11px; color: #666;";
        row.querySelector(".yX")?.appendChild(badge);

        chrome.storage.local.get([emailKey], async (result) => {
            if (result[emailKey]) {
                applySecurityStyle(badge, result[emailKey].label);
                return;
            }

            try {
                const response = await fetch("http://127.0.0.1:5000/api/classify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sender_email: sender, text: snippet })
                });
                const data = await response.json();
                
                const saveObj = {};
                saveObj[emailKey] = { label: data.label, timestamp: Date.now() };
                chrome.storage.local.set(saveObj);

                applySecurityStyle(badge, data.label);
            } catch (err) {
                badge.innerText = " [Offline] ";
            }
        });
    }
}

function applySecurityStyle(badge, label) {
    badge.innerText = ` [${label.toUpperCase()}] `;
    badge.style.borderRadius = "3px";
    badge.style.padding = "2px 6px";
    badge.style.color = "white";
    badge.style.marginLeft = "10px";

    if (label === "phishing") {
        badge.style.backgroundColor = "#d93025"; 
    } else if (label === "suspicious") {
        badge.style.backgroundColor = "#f29900"; 
    } else {
        badge.style.backgroundColor = "#188038"; 
    }
}

// Optimized Observer with Debounce
let debounceTimer;
const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(processInboxRows, 500);
});

observer.observe(document.body, { childList: true, subtree: true });
processInboxRows();