document.addEventListener('DOMContentLoaded', function() {
    // 1. Initial Load of Counts
    updateDisplayCounts();

    const scanBtn = document.getElementById('scanBtn');
    
    if (scanBtn) {
        scanBtn.addEventListener('click', async () => {
            const status = document.getElementById('status');
            const results = document.getElementById('results');
            
            status.innerText = "Extracting...";
            scanBtn.disabled = true;

            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                
                chrome.tabs.sendMessage(tab.id, { action: "scanEmail" }, async (response) => {
                    if (!response) {
                        status.innerText = "Error: Refresh Gmail and try again.";
                        scanBtn.disabled = false;
                        return;
                    }

                    status.innerText = "AI Analyzing...";
                    results.classList.remove('hidden');
                    document.getElementById('sender').innerText = response.sender;
                    document.getElementById('preview').innerText = response.text;

                    const apiRes = await fetch("http://127.0.0.1:5000/api/classify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sender_email: response.sender, text: response.text })
                    });
                    
                    const data = await apiRes.json();
                    const label = data.label.toLowerCase();

                    // Update UI
                    const v = document.getElementById('verdict');
                    v.innerText = label.toUpperCase();
                    v.className = `label ${label}`;
                    document.getElementById('reason').innerText = data.reason;

                    // Update Storage Counters
                    chrome.storage.local.get([label], (result) => {
                        let count = (result[label] || 0) + 1;
                        chrome.storage.local.set({ [label]: count }, () => {
                            updateDisplayCounts();
                        });
                    });

                    status.innerText = "Done.";
                    scanBtn.disabled = false;
                });
            } catch (err) {
                status.innerText = "Connection Error.";
                scanBtn.disabled = false;
            }
        });
    }
});

function updateDisplayCounts() {
    chrome.storage.local.get(['phishing', 'suspicious', 'safe'], (res) => {
        if (document.getElementById('cnt-phishing')) 
            document.getElementById('cnt-phishing').innerText = res.phishing || 0;
        if (document.getElementById('cnt-suspicious')) 
            document.getElementById('cnt-suspicious').innerText = res.suspicious || 0;
        if (document.getElementById('cnt-safe')) 
            document.getElementById('cnt-safe').innerText = res.safe || 0;
    });
}