import os
import re
import io
import json
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

# Load Trained Models & Objects
print("Loading NeuroShield ML Artifacts...")

try:
    rf_intrusion = joblib.load(os.path.join(MODEL_DIR, 'intrusion_model.pkl'))
    scaler_intrusion = joblib.load(os.path.join(MODEL_DIR, 'intrusion_scaler.pkl'))
    encoders_intrusion = joblib.load(os.path.join(MODEL_DIR, 'intrusion_encoders.pkl'))

    clf_scam = joblib.load(os.path.join(MODEL_DIR, 'scam_model.pkl'))
    tfidf_scam = joblib.load(os.path.join(MODEL_DIR, 'scam_tfidf.pkl'))

    clf_email = joblib.load(os.path.join(MODEL_DIR, 'email_model.pkl'))
    tfidf_email = joblib.load(os.path.join(MODEL_DIR, 'email_tfidf.pkl'))
    print("All ML models loaded successfully!")
except Exception as e:
    print(f"Warning loading model files: {e}. Run train_models.py first!")


# -----------------------------------------------------------
# Helper Rules & Heuristics
# -----------------------------------------------------------
SUSPICIOUS_KEYWORDS = {
    'urgent': 'High Panic Urgency',
    'immediately': 'Urgency Trigger',
    'verify': 'Credential Verification Prompt',
    'bank': 'Financial Entity Target',
    'otp': 'Authentication Code Request',
    'password': 'Credential Request',
    'refund': 'Financial Incentive Bait',
    'lottery': 'Incentive Scam Trigger',
    'winner': 'Prize Incentive',
    'reward': 'Reward Points Bait',
    'suspended': 'Coercive Threat',
    'locked': 'Coercive Access Threat',
    'transfer': 'Financial Action',
    'wire': 'Wire Transfer Trigger',
    'crypto': 'Cryptocurrency Risk',
    'bitcoin': 'Untraceable Payment Asset',
    'telegram': 'Unregulated Communication Channel',
    'whatsapp': 'Direct Messaging Vector',
    'claim': 'Action Prompt',
    'click': 'Link Engagement Prompt',
    'login': 'Credential Harvesting Entry',
    'fee': 'Advance-Fee Fraud Indicator',
    'guaranteed': 'Unrealistic Returns Claim'
}

ATTACK_EXPLANATIONS = {
    'DoS': {
        'risk': 'Critical',
        'desc': 'Denial of Service attack detected. High volume SYN flood / packet flood aiming to exhaust server socket buffers and CPU cycles.',
        'recommendation': 'Trigger rate limiting, block source IP block on perimeter firewall, activate DDoS mitigation routing.'
    },
    'Probe': {
        'risk': 'High',
        'desc': 'Reconnaissance / Port scanning activity detected. Adversary is probing open ports and mapping active network services.',
        'recommendation': 'Drop scanning packets, obscure host response signatures, update intrusion prevention rules.'
    },
    'Brute Force': {
        'risk': 'High',
        'desc': 'Repeated automated credential guessing attack detected on authentication service endpoints.',
        'recommendation': 'Enforce IP account lockout, mandate multi-factor authentication (MFA), block automated user-agents.'
    },
    'Botnet': {
        'risk': 'Critical',
        'desc': 'Command & Control (C2) botnet traffic pattern detected. Machine may be compromised and communicating with remote bot master.',
        'recommendation': 'Isolate affected host immediately from network segment, initiate forensic memory scan.'
    },
    'R2L': {
        'risk': 'Critical',
        'desc': 'Remote-to-Local exploit attempt detected. Adversary sending unauthorized packets to gain local user privileges.',
        'recommendation': 'Patch service vulnerability, inspect daemon execution logs, apply strict boundary ACLs.'
    },
    'U2R': {
        'risk': 'Critical',
        'desc': 'User-to-Root privilege escalation attack detected. Local unprivileged account attempting root command execution.',
        'recommendation': 'Revoke active user sessions, audit system binaries and kernel patch level immediately.'
    },
    'Normal': {
        'risk': 'Low',
        'desc': 'Legitimate network flow. Connection parameters adhere to standard protocol baselines.',
        'recommendation': 'No action required. Standard telemetry monitoring active.'
    }
}


app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'success': False, 'message': 'The uploaded file exceeds the 10 MB limit.'}), 413


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'online',
        'service': 'NeuroShield Flask ML Microservice',
        'version': '1.0.0',
        'models_loaded': os.path.exists(os.path.join(MODEL_DIR, 'intrusion_model.pkl'))
    }), 200


# -----------------------------------------------------------
# POST /predictintrusion
# -----------------------------------------------------------
@app.route('/predictintrusion', methods=['POST'])
def predict_intrusion():
    try:
        df = None
        if 'file' in request.files:
            file = request.files['file']
            if not file or file.filename == '':
                return jsonify({'success': False, 'message': 'No selected file or empty file uploaded.'}), 400
            try:
                content = file.read().decode('utf-8')
                if not content.strip():
                    return jsonify({'success': False, 'message': 'Uploaded CSV file is empty.'}), 400
                df = pd.read_csv(io.StringIO(content))
            except Exception as pe:
                return jsonify({'success': False, 'message': f'Malformed CSV file: {str(pe)}'}), 400
        elif request.is_json:
            data = request.get_json()
            if isinstance(data, list):
                df = pd.DataFrame(data)
            elif isinstance(data, dict):
                df = pd.DataFrame([data])

        if df is None or df.empty:
            return jsonify({'success': False, 'message': 'No valid CSV data provided.'}), 400

        # Maximum row limit check
        if len(df) > 10000:
            return jsonify({'success': False, 'message': 'CSV exceeds maximum processing limit of 10,000 rows.'}), 400

        # Required columns strict check
        required_cols = ['duration', 'protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes',
                         'count', 'srv_count', 'serror_rate', 'rerror_rate', 'same_srv_rate', 'diff_srv_rate']

        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            return jsonify({
                'success': False,
                'message': 'Invalid CSV format.',
                'missing_columns': missing_cols
            }), 400

        # Validate numeric columns
        numeric_cols = ['duration', 'src_bytes', 'dst_bytes', 'count', 'srv_count', 'serror_rate', 'rerror_rate', 'same_srv_rate', 'diff_srv_rate']
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce')

        if df[numeric_cols].isnull().any().any():
            return jsonify({'success': False, 'message': 'CSV contains invalid or missing numeric values in required feature columns.'}), 400

        # Clean string categorical features
        df['protocol_type'] = df['protocol_type'].astype(str).str.lower().str.strip()
        df['service'] = df['service'].astype(str).str.lower().str.strip()
        df['flag'] = df['flag'].astype(str).str.upper().str.strip()

        le_p = encoders_intrusion['protocol_type']
        le_s = encoders_intrusion['service']
        le_f = encoders_intrusion['flag']

        # Strict categorical validation against encoder classes
        valid_protocols = [str(c).lower().strip() for c in le_p.classes_]
        invalid_p = [val for val in df['protocol_type'].unique() if val not in valid_protocols]
        if len(invalid_p) > 0:
            return jsonify({'success': False, 'message': f"CSV contains unsupported categorical value in column 'protocol_type': '{invalid_p[0]}'."}), 400

        valid_services = [str(c).lower().strip() for c in le_s.classes_]
        invalid_s = [val for val in df['service'].unique() if val not in valid_services]
        if len(invalid_s) > 0:
            return jsonify({'success': False, 'message': f"CSV contains unsupported categorical value in column 'service': '{invalid_s[0]}'."}), 400

        valid_flags = [str(c).upper().strip() for c in le_f.classes_]
        invalid_f = [val for val in df['flag'].unique() if val not in valid_flags]
        if len(invalid_f) > 0:
            return jsonify({'success': False, 'message': f"CSV contains unsupported categorical value in column 'flag': '{invalid_f[0]}'."}), 400

        df_enc = pd.DataFrame()
        df_enc['duration'] = df['duration'].astype(float)
        df_enc['protocol_type'] = df['protocol_type'].apply(lambda x: le_p.transform([x])[0])
        df_enc['service'] = df['service'].apply(lambda x: le_s.transform([x])[0])
        df_enc['flag'] = df['flag'].apply(lambda x: le_f.transform([x])[0])
        df_enc['src_bytes'] = df['src_bytes'].astype(float)
        df_enc['dst_bytes'] = df['dst_bytes'].astype(float)
        df_enc['count'] = df['count'].astype(float)
        df_enc['srv_count'] = df['srv_count'].astype(float)
        df_enc['serror_rate'] = df['serror_rate'].astype(float)
        df_enc['rerror_rate'] = df['rerror_rate'].astype(float)
        df_enc['same_srv_rate'] = df['same_srv_rate'].astype(float)
        df_enc['diff_srv_rate'] = df['diff_srv_rate'].astype(float)

        X_scaled = scaler_intrusion.transform(df_enc)
        preds = rf_intrusion.predict(X_scaled)
        probs = rf_intrusion.predict_proba(X_scaled)

        results = []
        threat_count = 0
        risk_summary = {'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0}
        attack_dist = {}

        total_confidence = 0.0

        for idx, (pred, prob_row) in enumerate(zip(preds, probs)):
            max_prob = float(np.max(prob_row))
            conf_pct = round(max_prob * 100, 2)
            total_confidence += conf_pct

            exp = ATTACK_EXPLANATIONS.get(pred, ATTACK_EXPLANATIONS['Normal'])
            risk = exp['risk']
            risk_summary[risk] = risk_summary.get(risk, 0) + 1
            attack_dist[pred] = attack_dist.get(pred, 0) + 1

            if pred != 'Normal':
                threat_count += 1

            results.append({
                'record_index': idx + 1,
                'attack_type': pred,
                'confidence': conf_pct,
                'risk_level': risk,
                'explanation': exp['desc'],
                'recommendation': exp['recommendation'],
                'features': {
                    'protocol': str(df.iloc[idx]['protocol_type']),
                    'service': str(df.iloc[idx]['service']),
                    'flag': str(df.iloc[idx]['flag']),
                    'src_bytes': int(df.iloc[idx]['src_bytes']),
                    'dst_bytes': int(df.iloc[idx]['dst_bytes']),
                    'count': int(df.iloc[idx]['count'])
                }
            })

        dominant_attack = max(set(preds), key=list(preds).count)
        overall_risk = ATTACK_EXPLANATIONS.get(dominant_attack, ATTACK_EXPLANATIONS['Normal'])['risk'] if threat_count > 0 else 'Low'
        avg_confidence = round(total_confidence / len(results), 2) if len(results) > 0 else 0.0

        return jsonify({
            'success': True,
            'total_records': len(results),
            'threats_detected': threat_count,
            'safe_records': len(results) - threat_count,
            'overall_risk': overall_risk,
            'risk_summary': risk_summary,
            'attack_distribution': attack_dist,
            'average_confidence': avg_confidence,
            'main_attack_category': dominant_attack,
            'results': results[:200]  # top 200 items max in response
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to process intrusion model prediction: {str(e)}'}), 500


# -----------------------------------------------------------
# POST /predictscam
# -----------------------------------------------------------
@app.route('/predictscam', methods=['POST'])
def predict_scam():
    try:
        data = request.get_json() or {}
        text = data.get('text', '').strip()

        if not text:
            return jsonify({'error': 'Text input cannot be empty.'}), 400

        # NLP preprocessing & tokenization
        text_lower = text.lower()

        X_vec = tfidf_scam.transform([text_lower])
        probs = clf_scam.predict_proba(X_vec)[0]
        categories = clf_scam.classes_

        top_idx = int(np.argmax(probs))
        predicted_category = str(categories[top_idx])
        confidence = float(probs[top_idx])

        # Keyword & pattern matching heuristics
        found_keywords = []
        for word, flag in SUSPICIOUS_KEYWORDS.items():
            pattern = r'\b' + re.escape(word) + r'\b'
            matches = re.findall(pattern, text_lower)
            if matches:
                found_keywords.append({
                    'word': word,
                    'tag': flag,
                    'count': len(matches)
                })

        # Calculate scam probability %
        if predicted_category == 'Safe':
            scam_prob = round((1.0 - confidence) * 100, 2)
            if len(found_keywords) >= 2:
                scam_prob = min(85.0, scam_prob + (len(found_keywords) * 15.0))
                if scam_prob > 40:
                    predicted_category = 'Phishing'
        else:
            scam_prob = round(max(confidence * 100, 65.0 + (len(found_keywords) * 5.0)), 2)
            scam_prob = min(99.9, scam_prob)

        # Risk level determination
        if scam_prob < 30:
            risk_level = 'Safe'
        elif scam_prob < 60:
            risk_level = 'Medium Risk'
        elif scam_prob < 85:
            risk_level = 'High Risk'
        else:
            risk_level = 'Critical Risk'

        # Generate AI explanation & advice
        if risk_level == 'Safe':
            explanation = "This message demonstrates normal conversational syntax with no urgent threat vectors or suspicious credential prompts detected."
            recommendations = [
                "No immediate action required.",
                "Always verify sender identity if personal data is requested in future communications."
            ]
        else:
            explanation = f"High probability scam message detected in category '{predicted_category}'. Language contains strong pressure tactics, suspicious key phrases, or unverified action prompts."
            recommendations = [
                "Do NOT click any embedded links or open attachments.",
                "Do NOT share OTPs, PINs, passwords, or banking credentials.",
                "Report sender number/email to your IT security administrator or official scam portal.",
                "Block sender immediately on your messaging application."
            ]

        return jsonify({
            'success': True,
            'text_sample': text[:200] + ('...' if len(text) > 200 else ''),
            'scam_probability': scam_prob,
            'category': predicted_category,
            'risk_level': risk_level,
            'flagged_keywords': found_keywords,
            'explanation': explanation,
            'recommendations': recommendations
        }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to analyze scam message: {str(e)}'}), 500


# -----------------------------------------------------------
# POST /predictemail
# -----------------------------------------------------------
@app.route('/predictemail', methods=['POST'])
def predict_email():
    try:
        data = request.get_json() or {}
        subject = data.get('subject', '').strip()
        sender = data.get('sender', '').strip()
        body = data.get('body', '').strip()
        url = data.get('url', '').strip()

        combined_str = f"Subject: {subject} | From: {sender} | Body: {body} | URL: {url}"

        if not (subject or body or url):
            return jsonify({'error': 'Please provide subject, body, or URL for analysis.'}), 400

        # Heuristic Analysis
        indicators = []
        risk_score = 15.0

        # 1. URL Analysis
        if url:
            url_lower = url.lower()
            if not url_lower.startswith('https://'):
                indicators.append('Insecure HTTP protocol connection link detected.')
                risk_score += 20.0
            if any(tld in url_lower for tld in ['.xyz', '.net', '.info', '.biz', '.top', '.ru', '.work', '.click']):
                indicators.append('Suspicious top-level domain (TLD) associated with phishing campaigns.')
                risk_score += 25.0
            if any(brand in url_lower for brand in ['paypal', 'netflix', 'apple', 'amazon', 'bank', 'login', 'verify']) and not any(official in url_lower for official in ['paypal.com', 'netflix.com', 'apple.com', 'amazon.com']):
                indicators.append('Brand impersonation / typosquatting domain signature detected.')
                risk_score += 30.0

        # 2. Sender Analysis
        if sender:
            sender_lower = sender.lower()
            if '@' in sender_lower:
                domain = sender_lower.split('@')[-1]
                if any(susp in domain for susp in ['free', 'temp', 'sec-alert', 'auth-verify', 'security-center']):
                    indicators.append('Suspicious sender domain name impersonating corporate security.')
                    risk_score += 25.0

        # 3. NLP Content Score
        X_e = tfidf_email.transform([combined_str.lower()])
        prob = clf_email.predict_proba(X_e)[0]
        nlp_phish_prob = prob[1] if len(prob) > 1 else prob[0]
        risk_score += (nlp_phish_prob * 35.0)

        # Keyword checks in body/subject
        body_subject = (subject + " " + body).lower()
        for kw in ['urgent', 'verify', 'suspended', 'unauthorized', 'password', 'immediately', 'tax', 'refund']:
            if kw in body_subject:
                indicators.append(f"High urgency keyword trigger detected: '{kw}'")
                risk_score += 8.0

        risk_score = min(99.0, max(5.0, round(risk_score, 1)))

        if risk_score > 75:
            threat_level = 'Critical Phishing Threat'
            recommended_action = 'Quarantine email immediately. Block sender domain on email security gateway.'
        elif risk_score > 45:
            threat_level = 'Moderate Phishing Risk'
            recommended_action = 'Flag email to end-user. Request out-of-band verification before clicking links.'
        else:
            threat_level = 'Low Threat / Likely Safe'
            recommended_action = 'Email appears clean. Standard vigilance recommended.'

        return jsonify({
            'success': True,
            'phishing_score': risk_score,
            'threat_level': threat_level,
            'indicators': list(set(indicators)),
            'threat_summary': f"Composite AI phishing analyzer derived risk score of {risk_score}/100 with {len(indicators)} suspicious flags detected.",
            'recommended_action': recommended_action
        }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to analyze phishing email: {str(e)}'}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"NeuroShield Flask ML Service listening on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
