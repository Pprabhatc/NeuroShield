# NeuroShield IDS Platform Architecture

## Data Flow Diagram

```text
[User / Security Analyst]
       │
       ▼
[React 18 + Vite Frontend (Port 3000)]
   - Cyber Dark UI (CrowdStrike aesthetic)
   - Recharts Visualizations
   - jsPDF Executive Security Reports
       │
       ▼ (HTTP REST + Bearer JWT)
[Node.js Express Gateway (Port 5000)]
   - Auth & Role Middleware
   - Storage Manager (Mongo + Fallback File Engine)
   - Audit Log Analytics Aggregation
       │
       ▼ (Internal Proxy)
[Python Flask ML Microservice (Port 5001)]
   ├── /predictintrusion  -> RandomForestClassifier (.pkl)
   ├── /predictscam       -> TF-IDF + LogisticRegression (.pkl)
   └── /predictemail      -> Domain Heuristics & Phishing Score
```

## Model Taxonomies

### 1. Network Intrusion
- **Normal**: Clean protocol telemetry
- **DoS**: Denial of Service (SYN Flood)
- **Probe**: Port scanning & network mapping
- **R2L**: Remote-to-Local compromise attempt
- **U2R**: User-to-Root privilege escalation
- **Brute Force**: Automated credential guessing
- **Botnet**: Command & Control telemetry

### 2. NLP Scam Categories
- **Phishing**: Credential harvesting links
- **Lottery Scam**: Sweepstakes incentive fraud
- **OTP Fraud**: Urgent verification code theft
- **Job Scam**: Advance-fee work from home scam
- **Banking Scam**: Account suspension threats
- **Investment Scam**: Crypto giveaway & guaranteed returns
- **Safe**: Standard human conversation
