import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'database.json');

// Ensure data directory exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial seed data for a ready-to-use office inventory demo
const defaultData = {
  // Entity 1: User
  users: [
    {
      id: 'usr_admin',
      phone: '+919876501234',
      name: 'Workshop Admin',
      role: 'Admin',
      createdAt: new Date().toISOString()
    }
  ],
  // Entity 2: Asset
  assets: [
    {
      id: 'ast_1',
      name: 'MacBook Pro 16" M3 Max',
      category: 'Laptop',
      serialNumber: 'MBP-2024-9011',
      status: 'Assigned',
      assignedTo: 'Sarah Chen (Lead Engineer)',
      location: 'Engineering Pod B',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ast_2',
      name: 'Dell UltraSharp 32" 4K Monitor',
      category: 'Monitor',
      serialNumber: 'DEL-U32-4421',
      status: 'Available',
      assignedTo: '',
      location: 'IT Storage Room 3A',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ast_3',
      name: 'Herman Miller Aeron Chair',
      category: 'Furniture',
      serialNumber: 'HMA-CH-8802',
      status: 'Available',
      assignedTo: '',
      location: 'Floor 2 Flex Area',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ast_4',
      name: 'ThinkPad P1 Gen 6 Workstation',
      category: 'Laptop',
      serialNumber: 'TP-P1-3319',
      status: 'Maintenance',
      assignedTo: '',
      location: 'Hardware Repair Desk',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ast_5',
      name: 'Apple iPad Pro 12.9" M2',
      category: 'Tablet',
      serialNumber: 'APP-IPD-7704',
      status: 'Assigned',
      assignedTo: 'Alex Rivera (Product Designer)',
      location: 'Design Studio 1',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  // Entity 3: AssetLog
  assetLogs: [
    {
      id: 'log_1',
      assetId: 'ast_1',
      action: 'ASSIGNED',
      details: 'Assigned to Sarah Chen (Lead Engineer)',
      performedBy: 'Workshop Admin',
      timestamp: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'log_2',
      assetId: 'ast_4',
      action: 'STATUS_CHANGED',
      details: 'Sent for battery replacement diagnostics',
      performedBy: 'Workshop Admin',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ]
};

// Read Database
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file:', err);
    return defaultData;
  }
}

// Write Database
function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// ----------------------------------------------------
// ENTITY 1: User Model
// ----------------------------------------------------
export const UserModel = {
  findByPhone(phone) {
    const db = readDB();
    return db.users.find(u => u.phone === phone);
  },
  findById(id) {
    const db = readDB();
    return db.users.find(u => u.id === id);
  },
  create({ phone, name = 'Team Member', role = 'Staff' }) {
    const db = readDB();
    const newUser = {
      id: 'usr_' + Date.now().toString(36),
      phone,
      name,
      role,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    writeDB(db);
    return newUser;
  }
};

// ----------------------------------------------------
// ENTITY 2: Asset Model
// ----------------------------------------------------
export const AssetModel = {
  findAll({ status, search } = {}) {
    const db = readDB();
    let results = db.assets;
    if (status && status !== 'All') {
      results = results.filter(a => a.status.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.assignedTo && a.assignedTo.toLowerCase().includes(q))
      );
    }
    return results;
  },
  findById(id) {
    const db = readDB();
    return db.assets.find(a => a.id === id);
  },
  findBySerial(serialNumber) {
    const db = readDB();
    return db.assets.find(a => a.serialNumber.toLowerCase() === serialNumber.toLowerCase());
  },
  create({ name, category, serialNumber, location, assignedTo = '' }) {
    const db = readDB();
    const status = assignedTo.trim() ? 'Assigned' : 'Available';
    const newAsset = {
      id: 'ast_' + Date.now().toString(36),
      name: name.trim(),
      category: category.trim(),
      serialNumber: serialNumber.trim().toUpperCase(),
      status,
      assignedTo: assignedTo.trim(),
      location: location.trim() || 'Main Office',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.assets.unshift(newAsset);
    writeDB(db);
    return newAsset;
  },
  updateStatus(id, { status, assignedTo, note }) {
    const db = readDB();
    const index = db.assets.findIndex(a => a.id === id);
    if (index === -1) return null;

    const asset = db.assets[index];
    if (status !== undefined) asset.status = status;
    if (assignedTo !== undefined) asset.assignedTo = assignedTo;
    asset.updatedAt = new Date().toISOString();

    db.assets[index] = asset;
    writeDB(db);
    return asset;
  }
};

// ----------------------------------------------------
// ENTITY 3: AssetLog Model
// ----------------------------------------------------
export const AssetLogModel = {
  create({ assetId, action, details, performedBy = 'System' }) {
    const db = readDB();
    const newLog = {
      id: 'log_' + Date.now().toString(36),
      assetId,
      action,
      details,
      performedBy,
      timestamp: new Date().toISOString()
    };
    db.assetLogs.unshift(newLog);
    writeDB(db);
    return newLog;
  },
  findByAssetId(assetId) {
    const db = readDB();
    return db.assetLogs.filter(l => l.assetId === assetId);
  }
};
