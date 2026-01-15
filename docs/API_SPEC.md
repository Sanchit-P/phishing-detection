# PhishGuard Backend API Specification
**Version:** 1.0  
**Base URL:** `http://127.0.0.1:5000`  
**Status:** Functional (Groq Llama-3 + Keyword Fallback + Confidence Guard)

---

## 1. Overview
This API receives raw email text and returns a security classification. It utilizes `Groq's Llama-3` (via the Groq API) for high-speed primary analysis and a `Keyword Scan` as a local fallback. It includes a "Confidence Guard" to manage low-certainty AI results.

---

## 2. Classification Endpoint

### `POST /api/classify`
Analyzes text for phishing indicators.

**Headers:**
| Key | Value |
| :--- | :--- |
| `Content-Type` | `application/json` |

**Request Body:**
```json
{
  "text": "The raw email text content goes here..."
}
```

## 3. Response Schema(Success 200 OK)
|Key        | Type      |  Description|
| :--- | :--- | :--- |
|`label`    | String    |  "The safety verdict: `safe`, `suspicious`, or `phishing`."|
|`reason`     | String    |  A concise explanation of the classification.|
|`confidence` | Float     |  AI certainty score from `0.0` to `1.0`.|

UI Implementation Guide
|Label      | Suggested UI Color |     Logic|
| :--- | :--- | :--- |
|`safe`      | Green              |     Standard emails with no malicious intent.|
|`suspicious` | Yellow / Orange    |     Triggered if risks are found but confidence is low (< 0.6).|
|`phishing`   |  Red               |      High-probability scam; urgent warning should be displayed.|

## 4. Example Scenarios
Case A: High-Confidence Phishing
```json
{
  "label": "phishing",
  "reason": "Detected a fake login link and urgent language typical of bank scams.",
  "confidence": 0.94
}
```

Case B: Low-Confidence / "Confidence Guard" Active
```json
{
  "label": "suspicious",
  "reason": "AI detected minor risks, but confidence is low. Proceed with caution.",
  "confidence": 0.45
}
```

## 5. Security & CORS
The backend uses `Flask-CORS`. If you encounter a 'Cross-Origin' error in the Chrome Extension:

Ensure the Python server is running (`python app.py`).

Verify the Extension is using the `POST` method.

Ensure the URL is exactly `http://127.0.0.1:5000/api/classify.`

## 6. Error Code
|Code    |   Meaning        | Fix |
| :--- | :--- | :--- |
|400     |    Bad Request   |  "Check if your JSON key is named ""text""."|
|500     |    Server Error  |   Check terminal logs for API key or connection issues.|