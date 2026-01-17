import os
import json
import csv
from flask import Flask, jsonify, request
from flask_cors import CORS # type: ignore
from dotenv import load_dotenv # type: ignore
from groq import Groq # type: ignore

load_dotenv()
app = Flask(__name__)
CORS(app)

# 1. Initialize Groq Client
API_KEYS = [os.getenv(k) for k in os.environ if k.startswith("GROQ_API_KEY_")]
API_KEYS = [k for k in API_KEYS if k]  # Remove empty entries

class KeyManager:
    def __init__(self, keys):
        self.keys = keys
        self.current_index = 0

    def get_client(self):
        # Create a new client using the current rotating key
        return Groq(api_key=self.keys[self.current_index])

    def rotate(self):
        # Switch to the next key in the list
        self.current_index = (self.current_index + 1) % len(self.keys)
        print(f"Switched to Groq Key Index: {self.current_index}")

key_manager = KeyManager(API_KEYS)

# 2. Keyword Engine: Load local CSV data
def load_keywords():
    keywords = {}
    keywords = {}
    try:
        with open('backend\keywords.csv', mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Use .get() to avoid KeyErrors if a row is malformed
                kw = row.get('Keyword')
                cat = row.get('Category')
                if kw and cat:
                    keywords[kw.strip().lower()] = cat.strip()
        print(f"Success: Loaded {len(keywords)} phishing signatures.")
    except Exception as e:
        print(f"Keyword Load Error: {e}")
    return keywords
PHISHING_KEYWORDS = load_keywords()

def local_keyword_scan(text):
    text_lower = text.lower()
    total_risk_score = 0
    found_categories = set()
    
    # Weighting system
    weights = {
        "Urgency": 5,           
        "Financial": 4,         
        "Crypto": 5,            
        "Government": 5,        
        "Security/Account": 3,  
        "IT/Admin": 3,          
        "Workplace": 2,         
        "Legal": 4,             
        "E-commerce": 2,        
        "Generic/Suspicious": 2,
        "Social": 1             
    }

    for word, category in PHISHING_KEYWORDS.items():
        if word.lower() in text_lower:
            total_risk_score += weights.get(category, 1)
            found_categories.add(category)

    # DECISION LOGIC
    if total_risk_score >= 5:
        return {
            "label": "phishing",
            "reason": f"High risk detected. Matches themes: {', '.join(found_categories)}.",
            "confidence": 0.8
        }
    elif total_risk_score >= 2:
        return {
            "label": "suspicious",
            "reason": f"Caution: Found {', '.join(found_categories)} related phrases.",
            "confidence": 0.5
        }
    else:
        return {
            "label": "safe",
            "reason": "No high-risk phishing signatures detected in the text.",
            "confidence": 0.4
        }

# 3. AI Analysis Logic
PROMPT_TEMPLATE = """
Act as a Senior Cyber Security Analyst specializing in Phishing Detection.
Analyze the following email metadata and content for malicious intent.

SENDER: {sender}
CONTENT: {email_content}

CHECKLIST FOR ANALYSIS:
1. SENDER REPUTATION: Does the sender address look spoofed or use a look-alike domain?
2. URGENCY & THREATS: Does it use "fear-ware" tactics (e.g., "Account locked", "Legal action")?
3. CALL TO ACTION: Is there a suspicious link or a request for sensitive info (PII)?
4. GRAMMAR/STYLE: Are there unusual errors or generic salutations like "Dear Customer"?

Return your final assessment in JSON format ONLY. 
JSON FORMAT:
{{
  "label": "phishing", "suspicious", or "safe",
  "reason": "Provide a concise explanation based on the checklist above.",
  "confidence": 0.0 to 1.0
}}
"""

# 4. Main Classification Endpoint
@app.route('/api/classify', methods=['POST'])
def classify_email():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    sender = data.get('sender_email', 'Unknown')
    email_text = data.get('text', '')

    # --- ATTEMPT 1: GROQ AI ---
    for attempt in range(len(API_KEYS)):
        try:
            client = key_manager.get_client()
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a cyber security expert. Respond only in valid JSON."},
                    {"role": "user", "content": PROMPT_TEMPLATE.format(sender=sender, email_content=email_text)}
                ],
                response_format={"type": "json_object"},
                timeout=5
            )
            # If successful, return the AI result and EXIT the function immediately
            return jsonify(json.loads(response.choices[0].message.content)), 200

        except Exception as e:
            err_msg = str(e).lower()
            if "429" in err_msg or "rate_limit_exceeded" in err_msg:
                print(f"Key {key_manager.current_index} rate-limited. Rotating...")
                key_manager.rotate()
                continue 
            
            # For other critical errors (Network down, invalid key), break the loop to go to fallback
            print(f"API Error: {e}. Moving to fallback...")
            break

    # --- ATTEMPT 2: LOCAL FALLBACK (The Safety Net) ---
    # This part ONLY runs if the loop above finishes (all keys failed) or breaks
    print("API failed or exhausted. Running local keyword scan...")
    fallback_result = local_keyword_scan(email_text)
    
    # Ensure this returns a 200 so the Chrome Extension doesn't show an error
    return jsonify(fallback_result), 200

if __name__ == '__main__':
    # Running on port 5000 as per manifest.json
    app.run(debug=True, port=5000)