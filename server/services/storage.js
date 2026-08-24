const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Data Structure
const initialData = {
  users: [],
  scans: [
    {
      id: "scan-init-001",
      userId: "demo-analyst",
      type: "Intrusion",
      target: "network_telemetry_batch1.csv",
      attackType: "DoS",
      confidence: 98.4,
      riskLevel: "Critical",
      summary: "Denial of Service attack (SYN flood) detected in packet telemetry.",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: "scan-init-002",
      userId: "demo-analyst",
      type: "Scam NLP",
      target: "SMS Message (OTP Fraud)",
      attackType: "OTP Fraud",
      confidence: 96.2,
      riskLevel: "High Risk",
      summary: "Urgent OTP verification code request detected.",
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: "scan-init-003",
      userId: "demo-analyst",
      type: "Phishing Email",
      target: "support@security-alert-center.net",
      attackType: "Phishing",
      confidence: 91.5,
      riskLevel: "High Risk",
      summary: "Brand impersonation and fake verification portal link.",
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: "scan-init-004",
      userId: "demo-analyst",
      type: "Intrusion",
      target: "sample_normal_stream.csv",
      attackType: "Normal",
      confidence: 99.1,
      riskLevel: "Safe",
      summary: "Standard HTTP protocol traffic adhering to baseline telemetry.",
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ]
};

if (!fs.existsSync(FILE_PATH)) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(initialData, null, 2));
}

const readStore = () => {
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return initialData;
  }
};

const writeStore = (data) => {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing store JSON:', err);
  }
};

module.exports = {
  getUsers: () => readStore().users || [],
  addUser: (user) => {
    const store = readStore();
    store.users = store.users || [];
    store.users.push(user);
    writeStore(store);
    return user;
  },
  findUserByEmail: (email) => {
    const store = readStore();
    return (store.users || []).find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  findUserById: (id) => {
    const store = readStore();
    return (store.users || []).find(u => u.id === id);
  },
  getScans: () => readStore().scans || [],
  addScan: (scan) => {
    const store = readStore();
    store.scans = store.scans || [];
    store.scans.unshift(scan);
    writeStore(store);
    return scan;
  },
  deleteScan: (id) => {
    const store = readStore();
    store.scans = (store.scans || []).filter(s => s.id !== id);
    writeStore(store);
    return true;
  }
};
