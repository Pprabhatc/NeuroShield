import os
import re
import io
import json
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import pypdf

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

# Load Trained Models & Objects
print("Loading NeuroShield ML Artifacts (CICIDS2017, Multi-file PDF Parser & High-Precision NLP TF-IDF)...")

try:
    if os.path.exists(os.path.join(MODEL_DIR, 'cicids2017_model.pkl')):
        rf_intrusion = joblib.load(os.path.join(MODEL_DIR, 'cicids2017_model.pkl'))
        scaler_intrusion = joblib.load(os.path.join(MODEL_DIR, 'cicids2017_scaler.pkl'))
        encoders_intrusion = joblib.load(os.path.join(MODEL_DIR, 'cicids2017_encoders.pkl'))
    else:
        rf_intrusion = joblib.load(os.path.join(MODEL_DIR, 'intrusion_model.pkl'))
        scaler_intrusion = joblib.load(os.path.join(MODEL_DIR, 'intrusion_scaler.pkl'))
        encoders_intrusion = joblib.load(os.path.join(MODEL_DIR, 'intrusion_encoders.pkl'))

    clf_scam = joblib.load(os.path.join(MODEL_DIR, 'scam_model.pkl'))
    tfidf_scam = joblib.load(os.path.join(MODEL_DIR, 'scam_tfidf.pkl'))

    clf_email = joblib.load(os.path.join(MODEL_DIR, 'email_model.pkl'))
    tfidf_email = joblib.load(os.path.join(MODEL_DIR, 'email_tfidf.pkl'))
    print("All ML & NLP models loaded successfully!")
except Exception as e:
    print(f"Warning loading model files: {e}. Run train_models.py first!")


# -----------------------------------------------------------
# Helper Rules, Heuristics & Threat Catalog
# -----------------------------------------------------------
SUSPICIOUS_KEYWORDS = {
    'arrest warrant': 'Fake Legal Warrant Extortion',
    'arrest': 'Arrest Coercion Threat',
    'warrant': 'Legal Warrant Indicator',
    'cyber police': 'Law Enforcement Impersonation',
    'police': 'Police Authority Impersonation',
    'police station': 'Law Enforcement Location Threat',
    'supreme court': 'Judicial Authority Threat',
    'high court': 'High Court Legal Threat',
    'district court': 'Court Order Threat',
    'court': 'Judicial Entity Target',
    'non-bailable warrant': 'Coercive Arrest Threat',
    'non-bailable': 'Non-Bailable Warrant Indicator',
    'legal action': 'Legal Penalty Coercion',
    'cbi notice': 'CBI Law Enforcement Threat',
    'cbi': 'Central Bureau of Investigation Impersonation',
    'court fee': 'Fake Legal Fee Demand',
    'asset seizure': 'Financial Coercion Threat',
    'seizure': 'Asset Attachment Threat',
    'cyber crime division': 'Law Enforcement Impersonation',
    'cyber cell': 'Cyber Cell Police Threat',
    'digital arrest': 'Digital Arrest Extortion Scheme',
    'subpoena': 'Fake Subpoena Notice',
    'fir': 'First Information Report (FIR) Threat',
    'ipc': 'Indian Penal Code (IPC) Threat',
    'section 420': 'Section 420 Fraud Threat',
    'section 66d': 'IT Act Section 66D Threat',
    'advocate': 'Legal Counsel Impersonation',
    'lawyer': 'Legal Representation Threat',
    'trai': 'TRAI Telecom Impersonation',
    'sim block': 'SIM Disconnection Threat',
    'sim disconnect': 'SIM Termination Threat',
    'prosecution': 'Criminal Prosecution Threat',
    'contempt': 'Contempt of Court Threat',
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
    'click': 'Link Engagement Prompt',
    'login': 'Credential Harvesting Entry',
    'guaranteed': 'Unrealistic Returns Claim'
}

ATTACK_EXPLANATIONS = {
    'DoS/DDoS': {
        'risk': 'Critical',
        'risk_score': 95,
        'desc': 'CICIDS2017 DoS/DDoS attack detected. High volume SYN flood / packet flood exhausting server sockets.',
        'recommendation': 'Enforce rate-limiting on perimeter firewall, drop SYN flood packets on destination port, activate upstream DDoS mitigation.'
    },
    'DoS': {
        'risk': 'Critical',
        'risk_score': 92,
        'desc': 'Denial of Service attack detected. High volume packet flood exhausting server resources.',
        'recommendation': 'Trigger rate limiting, block source IP block on perimeter firewall, activate DDoS mitigation.'
    },
    'PortScan/Probe': {
        'risk': 'High',
        'risk_score': 75,
        'desc': 'CICIDS2017 Reconnaissance / Port scanning activity detected. Adversary is probing active network services.',
        'recommendation': 'Drop scanning packets, obscure host response signatures, update IPS port scan rules.'
    },
    'Probe': {
        'risk': 'High',
        'risk_score': 72,
        'desc': 'Reconnaissance / Port scanning activity detected mapping network services.',
        'recommendation': 'Drop scanning packets and update intrusion prevention rules.'
    },
    'Brute Force': {
        'risk': 'High',
        'risk_score': 85,
        'desc': 'Repeated automated credential guessing attack detected (FTP/SSH/HTTP Patator).',
        'recommendation': 'Enforce IP account lockout, mandate multi-factor authentication (MFA), block automated user-agents.'
    },
    'Botnet': {
        'risk': 'Critical',
        'risk_score': 98,
        'desc': 'Command & Control (C2) botnet traffic pattern detected (ARES botnet payload).',
        'recommendation': 'Isolate affected host immediately from network segment, kill malicious C2 socket, initiate forensic memory scan.'
    },
    'Web Attack': {
        'risk': 'High',
        'risk_score': 88,
        'desc': 'Web Application Attack detected (SQL Injection / XSS / Directory Traversal).',
        'recommendation': 'Enable Web Application Firewall (WAF) inspect rules, sanitize input parameters, drop malicious SQL payloads.'
    },
    'Infiltration': {
        'risk': 'Critical',
        'risk_score': 96,
        'desc': 'Network Infiltration & Privilege Escalation attack detected.',
        'recommendation': 'Revoke active domain credentials, isolate target host, revoke active token sessions.'
    },
    'R2L': {
        'risk': 'Critical',
        'risk_score': 90,
        'desc': 'Remote-to-Local exploit attempt detected.',
        'recommendation': 'Patch service vulnerability and apply strict boundary ACLs.'
    },
    'U2R': {
        'risk': 'Critical',
        'risk_score': 94,
        'desc': 'User-to-Root privilege escalation attack detected.',
        'recommendation': 'Revoke active user sessions and audit system binaries immediately.'
    },
    'Normal': {
        'risk': 'Low',
        'risk_score': 10,
        'desc': 'Legitimate network flow. Connection parameters adhere to standard protocol baselines.',
        'recommendation': 'No action required. Standard telemetry monitoring active.'
    }
}


def analyze_text_nlp(text):
    text_lower = text.lower().strip()
    detected_indicators = []

    # Strict Word-Boundary Indicator Matching
    for kw, desc in SUSPICIOUS_KEYWORDS.items():
        pattern = r'\b' + re.escape(kw) + r'\b'
        if re.search(pattern, text_lower):
            detected_indicators.append(f"{desc} ('{kw}')")

    urls = re.findall(r'https?://[^\s]+', text)
    if urls:
        detected_indicators.append(f"Suspicious Web Link ({urls[0]})")

    # TF-IDF Model Prediction
    X_vec = tfidf_scam.transform([text])
    prediction = str(clf_scam.predict(X_vec)[0])
    probabilities = clf_scam.predict_proba(X_vec)[0]
    max_prob = float(np.max(probabilities))
    confidence = round(max_prob * 100, 2)

    base_score = 15.0
    if prediction != 'Safe':
        base_score = 65.0 + (max_prob * 30.0)

    # Word Boundary Legal & Threat Term Scanner
    legal_terms = ['police', 'warrant', 'arrest', 'court', 'summons', 'cyber cell', 'cyber crime', 
                   'cbi', 'ed', 'enforcement directorate', 'fir', 'ipc', 'lawyer', 'advocate', 
                   'legal notice', 'digital arrest', 'trai', 'sim block', 'seizure', 'prosecution', 
                   'subpoena', 'non-bailable', 'settlement fine', 'contempt', 
                   'section 420', 'section 66d', 'crime branch', 'police station', 'law enforcement']

    legal_hits = []
    for term in legal_terms:
        pattern = r'\b' + re.escape(term) + r'\b'
        if re.search(pattern, text_lower):
            legal_hits.append(term)

    if len(legal_hits) >= 1:
        prediction = 'Fake Legal Notice Fraud'
        confidence = max(confidence, 96.0)
        base_score = max(88.0 + (len(legal_hits) * 3.0), 92.0)

    # Banking & OTP Scams Boost with Word Boundaries
    has_bank = any(re.search(r'\b' + re.escape(w) + r'\b', text_lower) for w in ['bank', 'sbi', 'hdfc', 'icici', 'axis', 'netbanking'])
    has_otp = any(re.search(r'\b' + re.escape(w) + r'\b', text_lower) for w in ['otp', 'kyc', 'pan', 'code', 'pin'])

    if has_bank and has_otp:
        if prediction == 'Safe':
            prediction = 'OTP Fraud' if 'otp' in text_lower else 'Banking Scam'
        base_score = max(base_score, 90.0)

    # Handling Short Conversational Greetings & Zero TF-IDF Vector Matches
    short_greetings = ['hi', 'hii', 'hiii', 'hiiii', 'hello', 'hey', 'heyy', 'good morning', 'good evening', 'how are you', 'thanks', 'thank you', 'ok', 'okay', 'bye']
    clean_text_words = re.findall(r'\b\w+\b', text_lower)
    
    is_short_greeting = (len(clean_text_words) <= 3 and any(w in short_greetings for w in clean_text_words)) or text_lower in short_greetings
    is_zero_vector = (X_vec.nnz == 0)

    if (is_short_greeting or is_zero_vector) and len(legal_hits) == 0 and not (has_bank and has_otp) and len(detected_indicators) == 0:
        prediction = 'Safe'
        confidence = 99.0
        base_score = 10.0

    if len(detected_indicators) >= 2 and base_score < 75.0 and len(legal_hits) == 0:
        base_score += 15.0

    # Ensure clean legitimate messages remain Safe
    if len(legal_hits) == 0 and not has_bank and not has_otp and len(detected_indicators) == 0 and prediction == 'Safe':
        base_score = 10.0

    risk_score = min(100.0, round(base_score, 1))

    if risk_score > 75:
        alert_level = 'Critical Threat Alert'
    elif risk_score > 50:
        alert_level = 'High Risk Threat'
    elif risk_score > 25:
        alert_level = 'Moderate Suspicion'
    else:
        alert_level = 'Low / Legitimate'

    if prediction == 'Fake Legal Notice Fraud':
        recommended_action = (
            "DO NOT pay any money, fine, or wire transfer. Official law enforcement agencies (Police, CBI, Courts) "
            "NEVER demand immediate crypto/UPI payment via SMS or messaging apps. Verify any notice at your official local police station or court registry."
        )
    elif prediction == 'Phishing':
        recommended_action = "DO NOT click links or enter credentials. Report sender domain, reset active session tokens, and block domain on email gateway."
    elif prediction == 'OTP Fraud':
        recommended_action = "NEVER disclose OTPs or 2FA codes. Contact your bank support immediately using the official phone number on your card."
    elif prediction == 'Banking Scam':
        recommended_action = "Contact your bank's official customer service immediately. Do not update KYC via unverified third-party links."
    elif prediction in ['Lottery Scam', 'Job Scam', 'Investment Scam']:
        recommended_action = "Avoid upfront registration or processing fees. Legitimate employers and investments never demand money before onboarding."
    else:
        recommended_action = "Document text appears clean. Continue standard digital safety vigilance."

    return {
        'threat_category': prediction,
        'confidence': confidence,
        'risk_score': risk_score,
        'alert_level': alert_level,
        'is_alert': risk_score >= 50,
        'indicators': list(set(detected_indicators)),
        'threat_summary': f"High-precision NLP & Conversational Guard engine classified input as '{prediction}' with a Risk Score of {risk_score}/100.",
        'recommended_action': recommended_action
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
        'version': '3.2.0',
        'models_loaded': True,
        'cicids2017_supported': True,
        'pdf_doc_support': True,
        'nlp_fake_legal_notice_supported': True,
        'greeting_conversational_guard': True
    }), 200


# -----------------------------------------------------------
# POST /predictintrusion (Multi-file: PDF, TXT, LOG, CSV, JSON)
# -----------------------------------------------------------
@app.route('/predictintrusion', methods=['POST'])
def predict_intrusion():
    try:
        df = None
        extracted_text = ""
        filename = "payload.csv"

        if 'file' in request.files:
            file = request.files['file']
            if not file or file.filename == '':
                return jsonify({'success': False, 'message': 'No selected file uploaded.'}), 400

            filename = file.filename
            filename_lower = filename.lower()

            if filename_lower.endswith('.pdf'):
                try:
                    pdf_bytes = file.read()
                    reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
                    for page in reader.pages:
                        txt = page.extract_text()
                        if txt:
                            extracted_text += txt + "\n"
                except Exception as pdf_err:
                    print(f"PDF extraction warning: {pdf_err}")
            else:
                raw_bytes = file.read()
                extracted_text = raw_bytes.decode('utf-8', errors='ignore')

            if ',' in extracted_text and '\n' in extracted_text:
                try:
                    df = pd.read_csv(io.StringIO(extracted_text))
                except Exception:
                    df = None

        elif request.is_json:
            data = request.get_json()
            if isinstance(data, list):
                df = pd.DataFrame(data)
            elif isinstance(data, dict):
                df = pd.DataFrame([data])

        if (df is None or df.empty or 'Destination_Port' not in df.columns and 'duration' not in df.columns) and extracted_text.strip():
            nlp_res = analyze_text_nlp(extracted_text)

            detailed_result = [{
                'record_index': 1,
                'attack_type': nlp_res['threat_category'],
                'confidence': nlp_res['confidence'],
                'risk_level': nlp_res['alert_level'],
                'risk_score': nlp_res['risk_score'],
                'explanation': nlp_res['threat_summary'],
                'recommendation': nlp_res['recommended_action'],
                'features': {
                    'file_name': filename,
                    'text_preview': extracted_text[:120].strip() + '...'
                }
            }]

            return jsonify({
                'success': True,
                'dataset_schema': 'Document/PDF Intelligence',
                'filename': filename,
                'total_analyzed': 1,
                'threat_count': 1 if nlp_res['is_alert'] else 0,
                'clean_count': 0 if nlp_res['is_alert'] else 1,
                'overall_risk_score': nlp_res['risk_score'],
                'is_alert': nlp_res['is_alert'],
                'threat_category': nlp_res['threat_category'],
                'avg_confidence': nlp_res['confidence'],
                'indicators': nlp_res['indicators'],
                'risk_summary': { nlp_res['alert_level']: 1 },
                'attack_distribution': { nlp_res['threat_category']: 1 },
                'detailed_results': detailed_result
            }), 200

        if df is None or df.empty:
            return jsonify({'success': False, 'message': 'Unable to parse file data. Please upload a valid PDF, TXT, LOG, or CSV file.'}), 400

        if len(df) > 10000:
            return jsonify({'success': False, 'message': 'File content exceeds maximum limit of 10,000 rows.'}), 400

        is_cicids = 'Destination_Port' in df.columns or 'Flow_Duration' in df.columns or 'Total_Fwd_Packets' in df.columns or 'dst_port' in df.columns

        if is_cicids:
            col_map = {
                'dst_port': 'Destination_Port',
                'duration': 'Flow_Duration',
                'fwd_pkts': 'Total_Fwd_Packets',
                'bwd_pkts': 'Total_Bwd_Packets',
                'fwd_len': 'Total_Length_of_Fwd_Packets',
                'bwd_len': 'Total_Length_of_Bwd_Packets',
                'protocol': 'Protocol'
            }
            df = df.rename(columns=col_map)

            req_cols = ['Destination_Port', 'Flow_Duration', 'Total_Fwd_Packets', 'Total_Bwd_Packets', 
                        'Total_Length_of_Fwd_Packets', 'Total_Length_of_Bwd_Packets', 'Flow_Bytes_s', 
                        'Flow_Packets_s', 'FIN_Flag_Count', 'SYN_Flag_Count', 'RST_Flag_Count', 'ACK_Flag_Count', 'Protocol']

            for c in req_cols:
                if c not in df.columns:
                    if c in ['FIN_Flag_Count', 'RST_Flag_Count']:
                        df[c] = 0
                    elif c in ['SYN_Flag_Count', 'ACK_Flag_Count']:
                        df[c] = 1
                    elif c == 'Protocol':
                        df[c] = 'tcp'
                    elif c in ['Flow_Bytes_s', 'Flow_Packets_s']:
                        df[c] = 100.0
                    else:
                        df[c] = 10

            df['Protocol'] = df['Protocol'].astype(str).str.lower().str.strip()
            df['Protocol'] = df['Protocol'].apply(lambda x: x if x in ['tcp', 'udp', 'icmp'] else 'tcp')

            le_proto = encoders_intrusion.get('Protocol', encoders_intrusion.get('protocol_type'))
            df_enc = df[req_cols].copy()
            df_enc['Protocol'] = df_enc['Protocol'].apply(lambda x: le_proto.transform([x])[0] if x in le_proto.classes_ else 0)

            X_scaled = scaler_intrusion.transform(df_enc)
        else:
            req_cols = ['duration', 'protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes',
                        'count', 'srv_count', 'serror_rate', 'rerror_rate', 'same_srv_rate', 'diff_srv_rate']
            
            for c in req_cols:
                if c not in df.columns:
                    df[c] = 0 if 'rate' in c else (1 if 'count' in c else 'http')

            df['protocol_type'] = df['protocol_type'].astype(str).str.lower().str.strip()
            df['service'] = df['service'].astype(str).str.lower().str.strip()
            df['flag'] = df['flag'].astype(str).str.upper().str.strip()

            le_p = encoders_intrusion.get('protocol_type', encoders_intrusion.get('Protocol'))

            df_enc = pd.DataFrame()
            df_enc['Destination_Port'] = 80
            df_enc['Flow_Duration'] = df['duration'].astype(float)
            df_enc['Total_Fwd_Packets'] = df['count'].astype(float)
            df_enc['Total_Bwd_Packets'] = df['srv_count'].astype(float)
            df_enc['Total_Length_of_Fwd_Packets'] = df['src_bytes'].astype(float)
            df_enc['Total_Length_of_Bwd_Packets'] = df['dst_bytes'].astype(float)
            df_enc['Flow_Bytes_s'] = (df['src_bytes'].astype(float) + df['dst_bytes'].astype(float)) / 10.0
            df_enc['Flow_Packets_s'] = (df['count'].astype(float) + df['srv_count'].astype(float)) / 10.0
            df_enc['FIN_Flag_Count'] = 0
            df_enc['SYN_Flag_Count'] = df['serror_rate'].apply(lambda x: 1 if float(x) > 0.5 else 0)
            df_enc['RST_Flag_Count'] = df['rerror_rate'].apply(lambda x: 1 if float(x) > 0.5 else 0)
            df_enc['ACK_Flag_Count'] = 1
            df_enc['Protocol'] = df['protocol_type'].apply(lambda x: le_p.transform([x])[0] if x in le_p.classes_ else 0)

            X_scaled = scaler_intrusion.transform(df_enc)

        preds = rf_intrusion.predict(X_scaled)
        probs = rf_intrusion.predict_proba(X_scaled)

        results = []
        threat_count = 0
        risk_summary = {'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0}
        attack_dist = {}
        total_confidence = 0.0
        max_risk_score = 10

        for idx, (pred, prob_row) in enumerate(zip(preds, probs)):
            max_prob = float(np.max(prob_row))
            conf_pct = round(max_prob * 100, 2)
            total_confidence += conf_pct

            exp = ATTACK_EXPLANATIONS.get(pred, ATTACK_EXPLANATIONS['Normal'])
            risk = exp['risk']
            r_score = exp.get('risk_score', 50 if risk != 'Low' else 10)
            if r_score > max_risk_score:
                max_risk_score = r_score

            risk_summary[risk] = risk_summary.get(risk, 0) + 1
            attack_dist[pred] = attack_dist.get(pred, 0) + 1

            if pred != 'Normal':
                threat_count += 1

            results.append({
                'record_index': idx + 1,
                'attack_type': pred,
                'confidence': conf_pct,
                'risk_level': risk,
                'risk_score': r_score,
                'explanation': exp['desc'],
                'recommendation': exp['recommendation'],
                'features': {
                    'port': int(df.iloc[idx].get('Destination_Port', 80)),
                    'duration': int(df.iloc[idx].get('Flow_Duration', df.iloc[idx].get('duration', 0))),
                    'protocol': str(df.iloc[idx].get('Protocol', df.iloc[idx].get('protocol_type', 'tcp'))),
                    'fwd_pkts': int(df.iloc[idx].get('Total_Fwd_Packets', df.iloc[idx].get('count', 0))),
                    'bwd_pkts': int(df.iloc[idx].get('Total_Bwd_Packets', df.iloc[idx].get('srv_count', 0)))
                }
            })

        avg_conf = round(total_confidence / len(results), 2) if len(results) > 0 else 0.0

        return jsonify({
            'success': True,
            'dataset_schema': 'CICIDS2017' if is_cicids else 'NSL-KDD',
            'filename': filename,
            'total_analyzed': len(results),
            'threat_count': threat_count,
            'clean_count': len(results) - threat_count,
            'overall_risk_score': max_risk_score if threat_count > 0 else 10,
            'is_alert': max_risk_score >= 60,
            'avg_confidence': avg_conf,
            'risk_summary': risk_summary,
            'attack_distribution': attack_dist,
            'detailed_results': results
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to process file telemetry: {str(e)}'}), 500


# -----------------------------------------------------------
# POST /predictscam (NLP Model + TF-IDF with Fake Legal Notice Fraud)
# -----------------------------------------------------------
@app.route('/predictscam', methods=['POST'])
def predict_scam():
    try:
        data = request.get_json() or {}
        text = data.get('text', '').strip()

        if not text:
            return jsonify({'success': False, 'message': 'No text content provided for NLP analysis.'}), 400

        res = analyze_text_nlp(text)
        return jsonify({
            'success': True,
            **res
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to analyze NLP text input: {str(e)}'}), 500


# -----------------------------------------------------------
# POST /predictemail (Phishing Email Analyzer)
# -----------------------------------------------------------
@app.route('/predictemail', methods=['POST'])
def predict_email():
    try:
        data = request.get_json() or {}
        subject = data.get('subject', '').strip()
        sender = data.get('sender', '').strip()
        body = data.get('body', '').strip()
        url = data.get('url', '').strip()

        if not body and not subject:
            return jsonify({'success': False, 'message': 'Email subject or body content required.'}), 400

        full_text = f"Subject: {subject} | From: {sender} | Body: {body} | URL: {url}"
        res = analyze_text_nlp(full_text)

        return jsonify({
            'success': True,
            'phishing_score': res['risk_score'],
            'threat_category': res['threat_category'],
            'threat_level': res['alert_level'],
            'is_alert': res['is_alert'],
            'indicators': res['indicators'],
            'threat_summary': res['threat_summary'],
            'recommended_action': res['recommended_action']
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to analyze phishing email: {str(e)}'}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"NeuroShield Flask ML Service listening on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
