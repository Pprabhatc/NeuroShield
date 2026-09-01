import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

print("Starting NeuroShield ML Model Training Pipeline...")

# ----------------------------------------------------
# 1. Network Intrusion Detection Model
# ----------------------------------------------------
print("Generating synthetic NSL-KDD dataset for Intrusion Detection...")
np.random.seed(42)
n_samples = 2100

protocols = ['tcp', 'udp', 'icmp']
services = ['http', 'private', 'smtp', 'ftp_data', 'dns', 'domain_u', 'other']
flags = ['SF', 'S0', 'REJ', 'RSTR', 'SH']

labels = ['Normal', 'DoS', 'Probe', 'R2L', 'U2R', 'Brute Force', 'Botnet']

data = []
for i in range(n_samples):
    label = np.random.choice(labels, p=[0.45, 0.20, 0.12, 0.08, 0.03, 0.07, 0.05])

    if label == 'Normal':
        dur = np.random.exponential(scale=2)
        proto = 'tcp' if np.random.rand() > 0.3 else ('udp' if np.random.rand() > 0.5 else 'icmp')
        srv = np.random.choice(['http', 'smtp', 'dns'], p=[0.6, 0.25, 0.15])
        flg = 'SF'
        src_b = int(np.random.normal(1200, 300))
        dst_b = int(np.random.normal(4500, 1000))
        cnt = int(np.random.randint(1, 15))
        srv_cnt = int(np.random.randint(1, 15))
        serr = round(np.random.uniform(0.0, 0.05), 2)
        rerr = round(np.random.uniform(0.0, 0.05), 2)
        same_srv = round(np.random.uniform(0.85, 1.0), 2)
        diff_srv = round(np.random.uniform(0.0, 0.1), 2)
    elif label == 'DoS':
        dur = 0
        proto = 'tcp'
        srv = 'private'
        flg = 'S0'
        src_b = 0
        dst_b = 0
        cnt = int(np.random.randint(150, 500))
        srv_cnt = int(np.random.randint(150, 500))
        serr = round(np.random.uniform(0.9, 1.0), 2)
        rerr = 0.0
        same_srv = round(np.random.uniform(0.9, 1.0), 2)
        diff_srv = round(np.random.uniform(0.0, 0.05), 2)
    elif label == 'Probe':
        dur = np.random.exponential(scale=10)
        proto = np.random.choice(protocols)
        srv = np.random.choice(services)
        flg = np.random.choice(['REJ', 'RSTR', 'S0'])
        src_b = int(np.random.randint(0, 100))
        dst_b = int(np.random.randint(0, 100))
        cnt = int(np.random.randint(40, 120))
        srv_cnt = int(np.random.randint(1, 5))
        serr = round(np.random.uniform(0.4, 0.8), 2)
        rerr = round(np.random.uniform(0.2, 0.6), 2)
        same_srv = round(np.random.uniform(0.05, 0.2), 2)
        diff_srv = round(np.random.uniform(0.6, 0.95), 2)
    elif label == 'Brute Force':
        dur = np.random.randint(5, 30)
        proto = 'tcp'
        srv = 'private'
        flg = 'SF'
        src_b = int(np.random.randint(200, 800))
        dst_b = int(np.random.randint(50, 200))
        cnt = int(np.random.randint(80, 250))
        srv_cnt = int(np.random.randint(80, 250))
        serr = round(np.random.uniform(0.0, 0.1), 2)
        rerr = round(np.random.uniform(0.3, 0.8), 2)
        same_srv = round(np.random.uniform(0.9, 1.0), 2)
        diff_srv = round(np.random.uniform(0.0, 0.05), 2)
    elif label == 'Botnet':
        dur = np.random.exponential(scale=15)
        proto = 'tcp'
        srv = 'domain_u'
        flg = 'SF'
        src_b = int(np.random.randint(50, 300))
        dst_b = int(np.random.randint(50, 300))
        cnt = int(np.random.randint(30, 90))
        srv_cnt = int(np.random.randint(30, 90))
        serr = round(np.random.uniform(0.0, 0.1), 2)
        rerr = 0.0
        same_srv = round(np.random.uniform(0.9, 1.0), 2)
        diff_srv = round(np.random.uniform(0.0, 0.05), 2)
    elif label == 'R2L':
        dur = np.random.randint(10, 100)
        proto = 'tcp'
        srv = np.random.choice(['ftp_data', 'smtp', 'http'])
        flg = 'SF'
        src_b = int(np.random.randint(1000, 8000))
        dst_b = int(np.random.randint(100, 1000))
        cnt = int(np.random.randint(1, 10))
        srv_cnt = int(np.random.randint(1, 5))
        serr = 0.0
        rerr = 0.0
        same_srv = round(np.random.uniform(0.8, 1.0), 2)
        diff_srv = 0.0
    else: # U2R
        dur = np.random.randint(20, 200)
        proto = 'tcp'
        srv = 'other'
        flg = 'SF'
        src_b = int(np.random.randint(2000, 15000))
        dst_b = int(np.random.randint(3000, 20000))
        cnt = int(np.random.randint(1, 5))
        srv_cnt = int(np.random.randint(1, 5))
        serr = 0.0
        rerr = 0.0
        same_srv = 1.0
        diff_srv = 0.0

    data.append({
        'duration': max(0, int(dur)),
        'protocol_type': proto,
        'service': srv,
        'flag': flg,
        'src_bytes': max(0, src_b),
        'dst_bytes': max(0, dst_b),
        'count': cnt,
        'srv_count': srv_cnt,
        'serror_rate': serr,
        'rerror_rate': rerr,
        'same_srv_rate': same_srv,
        'diff_srv_rate': diff_srv,
        'label': label
    })

df_intrusion = pd.DataFrame(data)

# Preprocessing Encoders
le_proto = LabelEncoder().fit(protocols)
le_service = LabelEncoder().fit(services)
le_flag = LabelEncoder().fit(flags)

df_enc = df_intrusion.copy()
df_enc['protocol_type'] = le_proto.transform(df_enc['protocol_type'])
df_enc['service'] = le_service.transform(df_enc['service'])
df_enc['flag'] = le_flag.transform(df_enc['flag'])

X_int = df_enc.drop(columns=['label'])
y_int = df_enc['label']

scaler = StandardScaler()
X_int_scaled = scaler.fit_transform(X_int)

rf_intrusion = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
rf_intrusion.fit(X_int_scaled, y_int)

joblib.dump(rf_intrusion, os.path.join(MODEL_DIR, 'intrusion_model.pkl'))
joblib.dump(scaler, os.path.join(MODEL_DIR, 'intrusion_scaler.pkl'))
joblib.dump({
    'protocol_type': le_proto,
    'service': le_service,
    'flag': le_flag,
    'feature_names': list(X_int.columns)
}, os.path.join(MODEL_DIR, 'intrusion_encoders.pkl'))

print("Network Intrusion Detection model trained & saved successfully!")

# Save sample dataset CSV for testing
dataset_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'datasets'))
os.makedirs(dataset_dir, exist_ok=True)
sample_csv_path = os.path.join(dataset_dir, 'sample_network_intrusion.csv')
df_intrusion.drop(columns=['label']).head(50).to_csv(sample_csv_path, index=False)
print(f"Sample intrusion dataset saved to {sample_csv_path}")

# ----------------------------------------------------
# 2. NLP Scam Classification Model
# ----------------------------------------------------
print("Training NLP Scam Classification Model...")

scam_samples = [
    # Phishing
    ("URGENT: Your Netflix account payment failed. Update details immediately at https://netflix-verify-login.sec-auth.com or account will be terminated.", "Phishing"),
    ("Dear customer, security breach detected in your Apple ID. Verify credentials now at http://appleid-security-reset.info", "Phishing"),
    ("PayPal alert: Unauthorized transaction of $499.00 detected. Click http://paypal-dispute-service.net to block transfer.", "Phishing"),
    ("Your Amazon account is locked due to unusual activity. Click here to confirm identity: http://amz-login-check.com", "Phishing"),
    ("IRS Urgent Notice: Tax refund outstanding of $1,450. Claim immediately via http://irs-tax-claim-gov.org", "Phishing"),

    # Lottery Scam
    ("CONGRATULATIONS! Your mobile number won $1,000,000 in International Mega Millions Sweepstakes! Claim now by emailing claim@megawin-corp.xyz", "Lottery Scam"),
    ("You have been selected as lucky winner of Brand New BMW X5! Reply WINNER to claim your prize key code.", "Lottery Scam"),
    ("Claim your $500 Walmart gift card bonus now! Limited to first 100 responders: http://free-walmart-bonus.net", "Lottery Scam"),

    # OTP Fraud
    ("Do not share: Your SBI NetBanking OTP is 849204. If you did not request this, call support at 1-800-FAKE-NUM immediately to cancel transaction of Rs 45,000.", "OTP Fraud"),
    ("Your HDFC Debit card OTP for online shopping is 921048. Valid for 5 mins. Share with executive to pause suspicious request.", "OTP Fraud"),
    ("Google Verification Code: 492019. Never share this code with anyone. A representative will call you to verify your identity.", "OTP Fraud"),

    # Job Scam
    ("Work from home opportunity! Earn $500/day by reviewing online products. No experience required. Pay $50 registration fee to begin immediately.", "Job Scam"),
    ("Congratulations! You are shortlisted for Data Entry Specialist role at Shell Corp. Transfer processing fee of $100 to receive laptop.", "Job Scam"),
    ("Urgent Hiring: Amazon Remote Associate. Salary $4,500/month. Contact HR manager on Telegram @amazon_hr_recruiter_fast", "Job Scam"),

    # Banking Scam
    ("ALERT: Your bank account will be suspended in 24 hours due to missing KYC update. Click http://bank-kyc-portal-online.in to update PAN & Aadhar.", "Banking Scam"),
    ("Dear HDFC customer, your account 4902** has been credited with Rs 1,50,000. Click to authorize receipt: http://hdfc-credit-fund.co", "Banking Scam"),
    ("Your Credit Card reward points worth 14,500 INR expiring today. Redeem cash directly into bank account at http://card-rewards-redeem.com", "Banking Scam"),

    # Investment Scam
    ("Guaranteed 300% returns in 7 days! Invest in automated Crypto AI bot trader. Join Telegram channel t.me/crypto_millionaire_insider", "Investment Scam"),
    ("Double your Bitcoin in 24 hours! Deposit BTC to official Musk GiveAway wallet address 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", "Investment Scam"),
    ("FxTrader Pro: Guaranteed profit scheme! Zero risk trading. Deposit $250 today and withdraw $2500 tomorrow.", "Investment Scam"),

    # Safe / Legitimate
    ("Hey Sarah, are we still meeting for lunch today at 1:00 PM at the downtown cafe?", "Safe"),
    ("Hi Team, attached is the revised project status deck for Q3 review. Let me know your thoughts.", "Safe"),
    ("Your Uber ride driver Alex is arriving in 3 minutes in Toyota Prius (ABC-1234).", "Safe"),
    ("Flight Reminder: Your flight AA-492 to JFK departs at 08:30 AM tomorrow from Gate B12.", "Safe"),
    ("Hi Dad, reached the hotel safely. Weather is great here. Will call you evening!", "Safe"),
    ("Your monthly electricity bill for August is Rs 2,340. Due date is Aug 25. Pay online at official portal https://statepower.gov.in", "Safe"),
    ("Dear user, your GitHub password was changed successfully on Aug 18, 2026. If this was not you, visit github.com/settings/security.", "Safe"),
    ("Meeting update: Standup shifted to 11:30 AM in Room 402. Please join Zoom link if remote.", "Safe")
]

# Expand dataset programmatically with variations to ensure robust training
augmented_samples = []
for text, cat in scam_samples:
    augmented_samples.append((text, cat))
    # Variations
    augmented_samples.append((text.lower(), cat))
    augmented_samples.append(("Fwd: " + text, cat))
    augmented_samples.append(("URGENT NOTICE: " + text, cat))

texts = [item[0] for item in augmented_samples]
categories = [item[1] for item in augmented_samples]

tfidf = TfidfVectorizer(ngram_range=(1, 2), max_features=3000, lowercase=True)
X_text = tfidf.fit_transform(texts)

clf_scam = LogisticRegression(C=1.5, max_iter=500)
clf_scam.fit(X_text, categories)

joblib.dump(clf_scam, os.path.join(MODEL_DIR, 'scam_model.pkl'))
joblib.dump(tfidf, os.path.join(MODEL_DIR, 'scam_tfidf.pkl'))

print("NLP Scam Detection model trained & saved successfully!")

# ----------------------------------------------------
# 3. Email Phishing Analyzer Model
# ----------------------------------------------------
print("Training Email Phishing Analyzer Pipeline...")

email_samples = [
    ("Action Required: Verify Account Credentials Immediately", "support@security-alert-center.net", "Dear Customer, We detected suspicious sign-in attempts on your corporate email account from IP 185.220.101.4. To protect your access, you must re-verify your password and 2FA credentials within 12 hours or access will be permanently suspended. Click here to confirm identity: http://corporate-sso-login-verify.com/auth", "http://corporate-sso-login-verify.com/auth", "Phishing"),
    ("Security Alert: Unusual sign-in activity", "no-reply@accounts.google.com", "We detected a new sign-in to your Google Account on a Windows device. If this was you, you don't need to do anything. If not, check your recent security activity at https://myaccount.google.com/notifications", "https://myaccount.google.com/notifications", "Safe"),
    ("Invoice #49201 Past Due", "billing@finance-partner-corp.xyz", "Please find attached your past due invoice for $4,820.00. Payment was due yesterday. Transfer funds to bank wire details in link below: http://secure-pay-gateway-online.biz/invoice", "http://secure-pay-gateway-online.biz/invoice", "Phishing"),
    ("Weekly Engineering Sync Agenda", "david.smith@company.com", "Hi all, please find the agenda for our weekly sprint review: 1. Sprint progress 2. Infrastructure refactoring 3. Release schedule. See document: https://docs.google.com/document/d/1029482", "https://docs.google.com/document/d/1029482", "Safe"),
]

# Combined text for email model
email_texts = [f"Subject: {s} | From: {sender} | Body: {b} | URL: {u}" for s, sender, b, u, cat in email_samples]
email_labels = [cat for s, sender, b, u, cat in email_samples]

tfidf_email = TfidfVectorizer(ngram_range=(1, 2), max_features=1500)
X_email = tfidf_email.fit_transform(email_texts)

clf_email = LogisticRegression(C=1.0)
clf_email.fit(X_email, email_labels)

joblib.dump(clf_email, os.path.join(MODEL_DIR, 'email_model.pkl'))
joblib.dump(tfidf_email, os.path.join(MODEL_DIR, 'email_tfidf.pkl'))

print("Email Phishing Analyzer model trained & saved successfully!")
print("All NeuroShield ML models ready!")
