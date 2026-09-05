import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

print("Starting NeuroShield ML Model Training Pipeline...")

# ----------------------------------------------------
# 1. CICIDS2017 Network Intrusion Detection Model
# ----------------------------------------------------
print("Generating CICIDS2017 dataset for ML Intrusion Detection...")
np.random.seed(42)
n_samples = 3500

cicids_labels = ['Normal', 'DoS/DDoS', 'PortScan/Probe', 'Botnet', 'Brute Force', 'Web Attack', 'Infiltration']
protocols = ['tcp', 'udp', 'icmp']

cicids_data = []
for i in range(n_samples):
    label = np.random.choice(cicids_labels, p=[0.40, 0.20, 0.12, 0.08, 0.08, 0.07, 0.05])
    
    if label == 'Normal':
        dst_port = np.random.choice([80, 443, 53, 22, 8080], p=[0.4, 0.4, 0.1, 0.05, 0.05])
        flow_dur = int(np.random.exponential(scale=15000))
        fwd_pkts = int(np.random.randint(2, 25))
        bwd_pkts = int(np.random.randint(2, 30))
        fwd_len = int(np.random.normal(1200, 300))
        bwd_len = int(np.random.normal(4500, 1000))
        flow_bytes_s = round(float((fwd_len + bwd_len) / (max(flow_dur, 1) / 1000.0)), 2)
        flow_pkts_s = round(float((fwd_pkts + bwd_pkts) / (max(flow_dur, 1) / 1000.0)), 2)
        fin_cnt = 0 if np.random.rand() > 0.2 else 1
        syn_cnt = 1
        rst_cnt = 0
        ack_cnt = 1
        proto = 'tcp' if dst_port != 53 else 'udp'

    elif label == 'DoS/DDoS':
        dst_port = np.random.choice([80, 443, 8080])
        flow_dur = int(np.random.randint(100, 2000))
        fwd_pkts = int(np.random.randint(300, 1500))
        bwd_pkts = int(np.random.randint(0, 10))
        fwd_len = int(np.random.randint(150000, 900000))
        bwd_len = int(np.random.randint(0, 1000))
        flow_bytes_s = round(float((fwd_len + bwd_len) / (max(flow_dur, 1) / 1000.0)), 2)
        flow_pkts_s = round(float((fwd_pkts + bwd_pkts) / (max(flow_dur, 1) / 1000.0)), 2)
        fin_cnt = 0
        syn_cnt = 1
        rst_cnt = int(np.random.choice([0, 1]))
        ack_cnt = 0
        proto = 'tcp'

    elif label == 'PortScan/Probe':
        dst_port = int(np.random.randint(1, 65535))
        flow_dur = int(np.random.randint(10, 500))
        fwd_pkts = int(np.random.randint(1, 3))
        bwd_pkts = int(np.random.randint(0, 2))
        fwd_len = int(np.random.randint(40, 120))
        bwd_len = int(np.random.randint(0, 80))
        flow_bytes_s = round(float((fwd_len + bwd_len) / (max(flow_dur, 1) / 1000.0)), 2)
        flow_pkts_s = round(float((fwd_pkts + bwd_pkts) / (max(flow_dur, 1) / 1000.0)), 2)
        fin_cnt = 0
        syn_cnt = 1
        rst_cnt = 1
        ack_cnt = 0
        proto = np.random.choice(['tcp', 'udp', 'icmp'])

    elif label == 'Botnet':
        dst_port = np.random.choice([6667, 8080, 443, 53])
        flow_dur = int(np.random.randint(30000, 120000))
        fwd_pkts = int(np.random.randint(15, 60))
        bwd_pkts = int(np.random.randint(15, 60))
        fwd_len = int(np.random.randint(1000, 5000))
        bwd_len = int(np.random.randint(1000, 5000))
        flow_bytes_s = round(float((fwd_len + bwd_len) / (max(flow_dur, 1) / 1000.0)), 2)
        flow_pkts_s = round(float((fwd_pkts + bwd_pkts) / (max(flow_dur, 1) / 1000.0)), 2)
        fin_cnt = 0
        syn_cnt = 1
        rst_cnt = 0
        ack_cnt = 1
        proto = 'tcp'

    elif label == 'Brute Force':
        dst_port = np.random.choice([22, 21, 3389, 80])
        flow_dur = int(np.random.randint(5000, 30000))
        fwd_pkts = int(np.random.randint(50, 200))
        bwd_pkts = int(np.random.randint(50, 200))
        fwd_len = int(np.random.randint(5000, 25000))
        bwd_len = int(np.random.randint(5000, 25000))
        flow_bytes_s = round(float((fwd_len + bwd_len) / (max(flow_dur, 1) / 1000.0)), 2)
        flow_pkts_s = round(float((fwd_pkts + bwd_pkts) / (max(flow_dur, 1) / 1000.0)), 2)
        fin_cnt = 1
        syn_cnt = 1
        rst_cnt = 1
        ack_cnt = 1
        proto = 'tcp'

    elif label == 'Web Attack':
        dst_port = np.random.choice([80, 443, 8080])
        flow_dur = int(np.random.randint(2000, 15000))
        fwd_pkts = int(np.random.randint(10, 50))
        bwd_pkts = int(np.random.randint(10, 50))
        fwd_len = int(np.random.randint(8000, 40000))
        bwd_len = int(np.random.randint(10000, 80000))
        flow_bytes_s = round(float((fwd_len + bwd_len) / (max(flow_dur, 1) / 1000.0)), 2)
        flow_pkts_s = round(float((fwd_pkts + bwd_pkts) / (max(flow_dur, 1) / 1000.0)), 2)
        fin_cnt = 0
        syn_cnt = 1
        rst_cnt = 0
        ack_cnt = 1
        proto = 'tcp'

    else: # Infiltration
        dst_port = np.random.choice([4444, 5555, 8080, 443])
        flow_dur = int(np.random.randint(10000, 60000))
        fwd_pkts = int(np.random.randint(20, 100))
        bwd_pkts = int(np.random.randint(20, 100))
        fwd_len = int(np.random.randint(20000, 100000))
        bwd_len = int(np.random.randint(20000, 150000))
        flow_bytes_s = round(float((fwd_len + bwd_len) / (max(flow_dur, 1) / 1000.0)), 2)
        flow_pkts_s = round(float((fwd_pkts + bwd_pkts) / (max(flow_dur, 1) / 1000.0)), 2)
        fin_cnt = 0
        syn_cnt = 1
        rst_cnt = 0
        ack_cnt = 1
        proto = 'tcp'

    cicids_data.append({
        'Destination_Port': int(dst_port),
        'Flow_Duration': max(1, int(flow_dur)),
        'Total_Fwd_Packets': max(1, int(fwd_pkts)),
        'Total_Bwd_Packets': max(0, int(bwd_pkts)),
        'Total_Length_of_Fwd_Packets': max(0, int(fwd_len)),
        'Total_Length_of_Bwd_Packets': max(0, int(bwd_len)),
        'Flow_Bytes_s': max(0.0, float(flow_bytes_s)),
        'Flow_Packets_s': max(0.0, float(flow_pkts_s)),
        'FIN_Flag_Count': int(fin_cnt),
        'SYN_Flag_Count': int(syn_cnt),
        'RST_Flag_Count': int(rst_cnt),
        'ACK_Flag_Count': int(ack_cnt),
        'Protocol': proto,
        'label': label
    })

df_cicids = pd.DataFrame(cicids_data)

le_cicids_proto = LabelEncoder().fit(protocols)

df_cicids_enc = df_cicids.copy()
df_cicids_enc['Protocol'] = le_cicids_proto.transform(df_cicids_enc['Protocol'])

X_cicids = df_cicids_enc.drop(columns=['label'])
y_cicids = df_cicids_enc['label']

cicids_scaler = StandardScaler()
X_cicids_scaled = cicids_scaler.fit_transform(X_cicids)

rf_cicids = RandomForestClassifier(n_estimators=120, max_depth=14, random_state=42)
rf_cicids.fit(X_cicids_scaled, y_cicids)

joblib.dump(rf_cicids, os.path.join(MODEL_DIR, 'cicids2017_model.pkl'))
joblib.dump(cicids_scaler, os.path.join(MODEL_DIR, 'cicids2017_scaler.pkl'))
joblib.dump({
    'Protocol': le_cicids_proto,
    'feature_names': list(X_cicids.columns)
}, os.path.join(MODEL_DIR, 'cicids2017_encoders.pkl'))

joblib.dump(rf_cicids, os.path.join(MODEL_DIR, 'intrusion_model.pkl'))
joblib.dump(cicids_scaler, os.path.join(MODEL_DIR, 'intrusion_scaler.pkl'))
joblib.dump({
    'protocol_type': le_cicids_proto,
    'service': LabelEncoder().fit(['http', 'private', 'smtp', 'ftp_data', 'dns', 'domain_u', 'other']),
    'flag': LabelEncoder().fit(['SF', 'S0', 'REJ', 'RSTR', 'SH']),
    'feature_names': list(X_cicids.columns)
}, os.path.join(MODEL_DIR, 'intrusion_encoders.pkl'))

print("CICIDS2017 Network Intrusion Detection model trained & saved successfully!")

# Save sample dataset CSV for CICIDS2017 testing
dataset_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'datasets'))
os.makedirs(dataset_dir, exist_ok=True)
sample_cicids_path = os.path.join(dataset_dir, 'sample_cicids2017_telemetry.csv')
df_cicids.drop(columns=['label']).head(50).to_csv(sample_cicids_path, index=False)
print(f"Sample CICIDS2017 telemetry saved to {sample_cicids_path}")

# ----------------------------------------------------
# 2. Comprehensive NLP Model + TF-IDF (Phishing, Scam & Fake Legal Notice)
# ----------------------------------------------------
print("Training High-Precision NLP Model + TF-IDF (Phishing, Scam & Fake Legal Notice)...")

scam_samples = [
    # Fake Legal Notice / Digital Arrest / Law Enforcement Extortion
    ("FINAL POLICE NOTICE: Non-bailable arrest warrant issued under section 420 by Cyber Crime Branch Delhi against your IP. Pay settlement fine of Rs 25,000 immediately to avoid arrest squad visiting your home.", "Fake Legal Notice Fraud"),
    ("SUPREME COURT SUMMONS: Case No. SC-84920/2026. You are charged with illegal digital asset transaction. Pay legal court fee via UPI or face immediate freezing of all bank accounts.", "Fake Legal Notice Fraud"),
    ("CBI CYBER DIVISION WARNING: Illegal contraband search found on your network IP address. Immediate arrest order generated. Transfer $1500 to legal court escrow account within 2 hours.", "Fake Legal Notice Fraud"),
    ("POLICE DEPARTMENT E-NOTICE: Court appearance mandatory tomorrow at 10 AM for identity impersonation. Click http://e-court-notice-verify.org to download subpoena warrant notice.", "Fake Legal Notice Fraud"),
    ("NATIONAL CRIME RECORDS BUREAU: Legal summons notice issued against your registered phone number. Pay clearance penalty online at http://ncrb-fine-settlement.in", "Fake Legal Notice Fraud"),
    ("HIGH COURT LEGAL NOTICE: Final warning prior to asset attachment and passport suspension. Contact Advocate Sharma immediately on 9810482019 to settle legal demand.", "Fake Legal Notice Fraud"),
    ("ENFORCEMENT DIRECTORATE ALERT: Money laundering investigation initiated against account holder. Submit affidavit and deposit security fee at http://ed-court-clearance.gov-auth.com", "Fake Legal Notice Fraud"),
    ("DIGITAL ARREST WARNING: You are placed under digital arrest by Cyber Cell Mumbai. Do not disconnect video call or police team will be dispatched to your location.", "Fake Legal Notice Fraud"),
    ("TRAI SIM DISCONNECTION NOTICE: Your mobile number will be blocked within 2 hours due to illegal harassment complaints lodged at Police Station. Call Inspector Rao now.", "Fake Legal Notice Fraud"),
    ("POLICE HEADQUARTERS NOTICE: FIR registered under IPC Section 420 and IT Act 66D against your name. Pay online fine of Rs 15,000 to drop charges immediately.", "Fake Legal Notice Fraud"),
    ("DISTRICT COURT LEGAL SUBPOENA: Attend hearing on Monday or face contempt of court warrant and immediate imprisonment.", "Fake Legal Notice Fraud"),

    # Phishing
    ("URGENT: Your Netflix account payment failed. Update details immediately at https://netflix-verify-login.sec-auth.com or account will be terminated.", "Phishing"),
    ("Dear customer, security breach detected in your Apple ID. Verify credentials now at http://appleid-security-reset.info", "Phishing"),
    ("PayPal alert: Unauthorized transaction of $499.00 detected. Click http://paypal-dispute-service.net to block transfer.", "Phishing"),
    ("Your Amazon account is locked due to unusual activity. Click here to confirm identity: http://amz-login-check.com", "Phishing"),
    ("IRS Urgent Notice: Tax refund outstanding of $1,450. Claim immediately via http://irs-tax-claim-gov.org", "Phishing"),

    # Lottery & Gift Scam
    ("CONGRATULATIONS! Your mobile number won $1,000,000 in International Mega Millions Sweepstakes! Claim now by emailing claim@megawin-corp.xyz", "Lottery Scam"),
    ("You have been selected as lucky winner of Brand New BMW X5! Reply WINNER to claim your prize key code.", "Lottery Scam"),
    ("Claim your $500 Walmart gift card bonus now! Limited to first 100 responders: http://free-walmart-bonus.net", "Lottery Scam"),

    # OTP Fraud
    ("Do not share: Your SBI NetBanking OTP is 849204. If you did not request this, call support at 1-800-FAKE-NUM immediately to cancel transaction of Rs 45,000.", "OTP Fraud"),
    ("Your HDFC Debit card OTP for online shopping is 921048. Valid for 5 mins. Share with executive to pause suspicious request.", "OTP Fraud"),
    ("Google Verification Code: 492019. Never share this code with anyone. A representative will call you to verify your identity.", "OTP Fraud"),

    # Job & Work-From-Home Scam
    ("Work from home opportunity! Earn $500/day by reviewing online products. No experience required. Pay $50 registration fee to begin immediately.", "Job Scam"),
    ("Congratulations! You are shortlisted for Data Entry Specialist role at Shell Corp. Transfer processing fee of $100 to receive laptop.", "Job Scam"),
    ("Urgent Hiring: Amazon Remote Associate. Salary $4,500/month. Contact HR manager on Telegram @amazon_hr_recruiter_fast", "Job Scam"),

    # Banking & Financial Scam
    ("ALERT: Your bank account will be suspended in 24 hours due to missing KYC update. Click http://bank-kyc-portal-online.in to update PAN & Aadhar.", "Banking Scam"),
    ("Dear HDFC customer, your account 4902** has been credited with Rs 1,50,000. Click to authorize receipt: http://hdfc-credit-fund.co", "Banking Scam"),
    ("Your Credit Card reward points worth 14,500 INR expiring today. Redeem cash directly into bank account at http://card-rewards-redeem.com", "Banking Scam"),

    # Crypto & Investment Scam
    ("Guaranteed 300% returns in 7 days! Invest in automated Crypto AI bot trader. Join Telegram channel t.me/crypto_millionaire_insider", "Investment Scam"),
    ("Double your Bitcoin in 24 hours! Deposit BTC to official Musk GiveAway wallet address 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", "Investment Scam"),

    # Legitimate / Safe Messages & Short Greetings
    ("hi", "Safe"),
    ("hii", "Safe"),
    ("hiii", "Safe"),
    ("hello", "Safe"),
    ("hello there", "Safe"),
    ("hey", "Safe"),
    ("hey bro", "Safe"),
    ("good morning", "Safe"),
    ("good evening", "Safe"),
    ("how are you", "Safe"),
    ("thanks", "Safe"),
    ("thank you", "Safe"),
    ("ok", "Safe"),
    ("okay", "Safe"),
    ("bye", "Safe"),
    ("see you tomorrow", "Safe"),
    ("Hey Sarah, are we still meeting for lunch today at 1:00 PM at the downtown cafe?", "Safe"),
    ("Hi Team, attached is the revised project status deck for Q3 review. Let me know your thoughts.", "Safe"),
    ("Your Uber ride driver Alex is arriving in 3 minutes in Toyota Prius (ABC-1234).", "Safe"),
    ("Flight Reminder: Your flight AA-492 to JFK departs at 08:30 AM tomorrow from Gate B12.", "Safe"),
    ("Hi Dad, reached the hotel safely. Weather is great here. Will call you evening!", "Safe"),
    ("Your monthly electricity bill for August is Rs 2,340. Due date is Aug 25. Pay online at official portal https://statepower.gov.in", "Safe"),
    ("Dear user, your GitHub password was changed successfully on Aug 18, 2026. If this was not you, visit github.com/settings/security.", "Safe"),
    ("Meeting update: Standup shifted to 11:30 AM in Room 402. Please join Zoom link if remote.", "Safe"),
    ("Your order #84920 from Flipkart has been dispatched and will be delivered by tomorrow evening.", "Safe"),
    ("OTP for Swiggy food delivery login is 4920. Valid for 10 minutes. Do not share with delivery agent.", "Safe")
]

augmented_samples = []
for text, cat in scam_samples:
    augmented_samples.append((text, cat))
    augmented_samples.append((text.lower(), cat))
    if cat == "Safe":
        augmented_samples.append((text + "!", cat))
        augmented_samples.append((text + ".", cat))

texts = [item[0] for item in augmented_samples]
categories = [item[1] for item in augmented_samples]

tfidf = TfidfVectorizer(ngram_range=(1, 3), max_features=6000, lowercase=True)
X_text = tfidf.fit_transform(texts)

clf_scam = LogisticRegression(C=3.0, max_iter=800)
clf_scam.fit(X_text, categories)

joblib.dump(clf_scam, os.path.join(MODEL_DIR, 'scam_model.pkl'))
joblib.dump(tfidf, os.path.join(MODEL_DIR, 'scam_tfidf.pkl'))

print("High-Precision NLP Model + TF-IDF (Phishing, Scam & Fake Legal Notice) trained & saved successfully!")

# ----------------------------------------------------
# 3. Email Phishing Analyzer Model
# ----------------------------------------------------
print("Training Email Phishing Analyzer Pipeline...")

email_samples = [
    ("Legal Action Notice: Supreme Court Summons Case #9204", "legal-notice@court-summons-portal.net", "Official Legal Warrant: You have failed to respond to prior cyber crime summons. An arrest order has been registered. Visit http://e-court-notice-verify.org/subpoena to clear legal penalty immediately.", "http://e-court-notice-verify.org/subpoena", "Fake Legal Notice Fraud"),
    ("Action Required: Verify Account Credentials Immediately", "support@security-alert-center.net", "Dear Customer, We detected suspicious sign-in attempts on your corporate email account from IP 185.220.101.4. To protect your access, you must re-verify your password and 2FA credentials within 12 hours or access will be permanently suspended. Click here to confirm identity: http://corporate-sso-login-verify.com/auth", "http://corporate-sso-login-verify.com/auth", "Phishing"),
    ("Security Alert: Unusual sign-in activity", "no-reply@accounts.google.com", "We detected a new sign-in to your Google Account on a Windows device. If this was you, you don't need to do anything. If not, check your recent security activity at https://myaccount.google.com/notifications", "https://myaccount.google.com/notifications", "Safe"),
    ("Invoice #49201 Past Due", "billing@finance-partner-corp.xyz", "Please find attached your past due invoice for $4,820.00. Payment was due yesterday. Transfer funds to bank wire details in link below: http://secure-pay-gateway-online.biz/invoice", "http://secure-pay-gateway-online.biz/invoice", "Phishing"),
    ("Weekly Engineering Sync Agenda", "david.smith@company.com", "Hi all, please find the agenda for our weekly sprint review: 1. Sprint progress 2. Infrastructure refactoring 3. Release schedule. See document: https://docs.google.com/document/d/1029482", "https://docs.google.com/document/d/1029482", "Safe"),
]

email_texts = [f"Subject: {s} | From: {sender} | Body: {b} | URL: {u}" for s, sender, b, u, cat in email_samples]
email_labels = [cat for s, sender, b, u, cat in email_samples]

tfidf_email = TfidfVectorizer(ngram_range=(1, 2), max_features=2000)
X_email = tfidf_email.fit_transform(email_texts)

clf_email = LogisticRegression(C=1.5)
clf_email.fit(X_email, email_labels)

joblib.dump(clf_email, os.path.join(MODEL_DIR, 'email_model.pkl'))
joblib.dump(tfidf_email, os.path.join(MODEL_DIR, 'email_tfidf.pkl'))

print("Email Phishing Analyzer model trained & saved successfully!")
print("All NeuroShield ML models ready!")
