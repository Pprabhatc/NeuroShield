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
  scans: []
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
