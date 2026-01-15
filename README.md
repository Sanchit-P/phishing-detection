# PhishGuard AI

[![Status](https://img.shields.io/badge/status-functional-brightgreen)](https://github.com)
[![Python](https://img.shields.io/badge/python-3.8+-blue)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/flask-3.1.2-red)](https://flask.palletsprojects.com/)
[![Chrome Extension](https://img.shields.io/badge/chrome-extension-yellow)](https://chromewebstore.google.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A **dual-layer phishing detection system** combining AI-powered analysis with local keyword scanning. PhishGuard AI helps Gmail users identify phishing emails in real-time using Groq's Llama-3 LLM with automatic fallback to keyword-based detection.

## 📋 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Configuration](#-configuration)
- [Contributing](#-contributing)
- [Support & Troubleshooting](#-support--troubleshooting)

---

## ✨ Features

- **Dual-Layer Detection:**
  - **Primary:** AI analysis using Groq's Llama-3-70B model for intelligent phishing detection
  - **Fallback:** Local keyword scanning when API is unavailable
  
- **Multi-Key Rotation:** Support for multiple Groq API keys with automatic rotation on rate limits

- **Confidence Scoring:** Returns confidence levels (0.0-1.0) for classification decisions

- **Real-Time Gmail Integration:** Chrome extension scans emails inline with visual badges

- **Dashboard Statistics:** Track phishing, suspicious, and safe email counts

- **Categorical Risk Assessment:** Weights phishing keywords by category (Urgency, Financial, Crypto, etc.)

- **CORS Enabled:** Works seamlessly with Chrome extension popup and content scripts

---

## 📁 Project Structure

```
phishing-detection/
├── backend/
│   ├── src/
│   │   └── app.py                 # Flask API server with Groq integration
│   ├── keywords.csv               # Phishing keyword database with categories
│   ├── .env                        # API key configuration (not in repo)
│   └── venv_phishing/              # Python virtual environment
├── extension/
│   ├── manifest.json              # Chrome extension manifest (v3)
│   ├── popup.html                 # Dashboard UI
│   ├── popup.js                   # Dashboard logic & stats
│   └── content.js                 # Gmail inbox scanner script
├── docs/
│   └── API_SPEC.md                # Detailed API specification
└── README.md                       # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Google Chrome** (v90+)
- **Groq API Key** (get free credits at [groq.com](https://console.groq.com))
- **Gmail account** with Chrome

### 1. Backend Setup (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/phishing-detection.git
cd phishing-detection

# Create and activate virtual environment
python -m venv backend/venv_phishing
.\backend\venv_phishing\Scripts\activate  # Windows
# or
source backend/venv_phishing/bin/activate # macOS/Linux

# Install dependencies
pip install flask flask-cors groq python-dotenv

# Configure API keys (see Configuration section)
# Then start the server
python backend/src/app.py
```

The backend will start on `http://127.0.0.1:5000`.

### 2. Chrome Extension Setup (1 minute)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **"Load unpacked"** and select the `extension/` folder
4. The PhishGuard AI extension should appear in your toolbar
5. Open Gmail and click the extension icon to start scanning

---

## 📦 Installation

### Backend Dependencies

The project uses the following Python packages:

```
flask==3.1.2
flask-cors==6.0.2
groq==1.0.0
python-dotenv==1.2.1
```

Install all at once:

```bash
pip install -r requirements.txt  # if available
# OR manually:
pip install flask flask-cors groq python-dotenv
```

### Chrome Extension

No installation required beyond the unpacking step. The extension is self-contained in the `extension/` folder.

---

## 🔧 Usage

### Backend API

The Flask server provides a single classification endpoint:

**POST** `/api/classify`

Request:
```json
{
  "sender_email": "accounts-recovery@bank-security.com",
  "text": "Click here immediately to verify your account before it's closed..."
}
```

Response:
```json
{
  "label": "phishing",
  "reason": "Detected a fake login link and urgent language typical of bank scams.",
  "confidence": 0.94
}
```

See [docs/API_SPEC.md](docs/API_SPEC.md) for complete API documentation.

### Chrome Extension

1. **Open an email in Gmail**
2. **Click the PhishGuard AI icon** in your Chrome toolbar
3. **Click "Analyze Email"** button
4. View the verdict:
   - 🔴 **Phishing** (Red): Likely a scam
   - 🟡 **Suspicious** (Yellow/Orange): Caution advised
   - 🟢 **Safe** (Green): No detected threats

The extension also **auto-scans** your inbox, adding badges to each email row.

### Example Workflow

```bash
# Terminal 1: Start the backend server
cd backend
python src/app.py
# Output: Running on http://127.0.0.1:5000 (Press CTRL+C to quit)

# Terminal 2: Open Chrome
# Navigate to Gmail → Click extension → Scan emails
```

---

## ⚙️ Configuration

### API Keys

Create a `.env` file in the `backend/` directory:

```env
GROQ_API_KEY_1=gsk_your_first_api_key_here
GROQ_API_KEY_2=gsk_your_second_api_key_here
```

**Why multiple keys?** The system automatically rotates keys when rate limits are hit, ensuring uninterrupted service.

### Keyword Database

Edit `backend/keywords.csv` to customize phishing signatures. Format:

```csv
Keyword,Category
verify your account,Security/Account
confirm identity,Security/Account
urgent action required,Urgency
wire transfer,Financial
cryptocurrency payment,Crypto
```

Supported categories (with weights):
- Urgency (5)
- Financial (4)
- Crypto (5)
- Government (5)
- Security/Account (3)
- IT/Admin (3)
- Workplace (2)
- Legal (4)
- E-commerce (2)
- Generic/Suspicious (2)
- Social (1)

---

## 📖 API Documentation

For detailed API information, including:
- Request/response schemas
- Error codes and handling
- Confidence scoring logic
- CORS configuration

See [docs/API_SPEC.md](docs/API_SPEC.md).

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes** and test thoroughly
4. **Commit** with clear messages: `git commit -m "Add feature: description"`
5. **Push** to your fork: `git push origin feature/your-feature`
6. **Open a Pull Request** with a description of your changes

### Areas for Contribution

- 🧠 Improve AI prompt engineering for better phishing detection
- 📊 Enhance keyword database with new phishing patterns
- 🎨 Improve extension UI/UX
- 🧪 Add unit and integration tests
- 📝 Improve documentation
- 🐛 Report and fix bugs

---

## 🆘 Support & Troubleshooting

### Common Issues

**Q: "Connection Error" when clicking "Analyze Email"**
- Ensure the backend server is running: `python backend/src/app.py`
- Check that it's listening on `http://127.0.0.1:5000`
- Verify no firewall is blocking port 5000

**Q: Extension shows "[Offline]" badges in inbox**
- Confirm the Flask server is running
- Check browser console (F12 → Console tab) for network errors
- Ensure CORS is enabled (it is by default in `app.py`)

**Q: "Bad Request (400)" from API**
- Verify the request includes both `sender_email` and `text` fields
- Check JSON formatting is valid

**Q: "Server Error (500)"**
- Check terminal logs for API key issues
- Ensure Groq API keys in `.env` are valid and have quota
- If all keys are rate-limited, the local keyword fallback will activate

**Q: Extension not showing in toolbar**
- Go to `chrome://extensions/`
- Ensure Developer Mode is enabled
- Re-load unpacked and select `extension/` folder again
- Restart Chrome if needed

### Getting Help

- 📋 Check existing [issues](https://github.com/yourusername/phishing-detection/issues)
- 💬 Open a new GitHub issue with:
  - OS and Chrome version
  - Error message (full text from console)
  - Steps to reproduce
  - Screenshots if applicable
- 📧 For security concerns, please email instead of opening a public issue

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👤 Maintainer

- **Sanchit** (Project Lead)

---

## 🙏 Acknowledgments

- [Groq](https://groq.com) for the fast Llama-3 API
- [Flask](https://flask.palletsprojects.com) for the lightweight web framework
- Chrome Extension API documentation

---

## 📊 Project Status

**Version:** 1.1  
**Status:** Functional (Groq Llama-3 + Keyword Fallback + Confidence Guard)

The system is production-ready with:
- ✅ Dual-layer detection (AI + Keywords)
- ✅ Multi-key rotation for reliability
- ✅ Real-time Gmail integration
- ✅ CORS-enabled API
- ✅ Error handling and fallbacks

---

**Start protecting against phishing today with PhishGuard AI!** 🛡️
