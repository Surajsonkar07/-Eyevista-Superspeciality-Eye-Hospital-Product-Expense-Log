import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, 'data');
const filePath = path.join(dataDir, 'sheets.json');
const usersFilePath = path.join(dataDir, 'users.json');

// Default initial sheets data
const DEFAULT_INITIAL_SHEETS = [
  {
    id: 'sheet-1',
    name: 'Main OT & Consumables',
    products: [
      {
        id: 'prod-1',
        productName: 'AcrySof IQ Toric IOL Pack',
        price: 18500,
        additionalInfo: 'Alcon - OT Suite 2 - Lot #8841A',
        timestamp: new Date().toISOString(),
        date: '17 Sep 2026',
        time: '08:30 AM',
        category: 'Medical Supplies',
        loggedBy: 'System Administrator',
      },
      {
        id: 'prod-2',
        productName: 'Moxifloxacin Eye Drops 10ml (Box of 10)',
        price: 2400,
        additionalInfo: 'Supplier: Micro Labs - Exp 2027',
        timestamp: new Date().toISOString(),
        date: '17 Sep 2026',
        time: '09:15 AM',
        category: 'Pharmacy',
        loggedBy: 'Pharmacy Staff',
      },
      {
        id: 'prod-3',
        productName: 'Viscoelastic Healon GV Syringe 1ml',
        price: 4200,
        additionalInfo: 'Johnson & Johnson - Phaco OT',
        timestamp: new Date().toISOString(),
        date: '17 Sep 2026',
        time: '10:00 AM',
        category: 'Medical Supplies',
        loggedBy: 'OT Nurse',
      },
    ],
    createdAt: new Date().toISOString(),
    budgetLimit: 50000,
  },
  {
    id: 'sheet-2',
    name: 'Pharmacy & Drops',
    products: [],
    createdAt: new Date().toISOString(),
    budgetLimit: 30000,
  },
  {
    id: 'sheet-3',
    name: 'OPD & Diagnostics',
    products: [],
    createdAt: new Date().toISOString(),
    budgetLimit: 25000,
  },
];

// Default Main Admin User Seed
const DEFAULT_INITIAL_USERS = [
  {
    id: 'user-admin-1',
    username: 'admin',
    password: 'admin123',
    fullName: 'System Administrator',
    role: 'admin',
    department: 'Hospital Management',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-staff-1',
    username: 'nurse',
    password: 'nurse123',
    fullName: 'OT Nurse Staff',
    role: 'staff',
    department: 'Main OT',
    createdAt: new Date().toISOString(),
  },
];

// Ensure local backup directory and files exist
const ensureLocalDataFiles = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(DEFAULT_INITIAL_SHEETS, null, 2), 'utf-8');
  }
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify(DEFAULT_INITIAL_USERS, null, 2), 'utf-8');
  }
};

// 1. Mongoose Product & Sheet Schemas
const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    additionalInfo: { type: String, default: '' },
    timestamp: { type: String },
    date: { type: String },
    time: { type: String },
    category: { type: String, default: 'General' },
    loggedBy: { type: String, default: 'Admin' },
    loggedByUserId: { type: String },
  },
  { _id: false }
);

const sheetSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    products: [productSchema],
    createdAt: { type: String },
    budgetLimit: { type: Number, default: 40000 },
    assignedUserId: { type: String },
  },
  { timestamps: true }
);

// 2. Mongoose User & Meta Schema
const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
    department: { type: String, default: 'General' },
    createdAt: { type: String },
  },
  { timestamps: true }
);

const metaSchema = new mongoose.Schema({ key: String, value: Boolean });

export const SheetModel = mongoose.models.Sheet || mongoose.model('Sheet', sheetSchema);
export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export const MetaModel = mongoose.models.Meta || mongoose.model('Meta', metaSchema);

let isMongoConnected = false;
let connectPromise = null;
let lastMongoError = null;
let lastFailedConnectTime = 0;
const RETRY_COOLDOWN_MS = 20000; // 20s cooldown before retrying Atlas connection

export function getDbStatus() {
  const readyState = mongoose.connection.readyState;
  return {
    connected: readyState === 1,
    readyState,
    error: lastMongoError,
  };
}

// 3. Connect to MongoDB Atlas or Local MongoDB instance
export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    lastMongoError = 'MONGODB_URI is not defined in environment variables.';
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    lastMongoError = null;
    return true;
  }

  // If a recent attempt failed, serve immediately from local fallback during cooldown
  if (Date.now() - lastFailedConnectTime < RETRY_COOLDOWN_MS) {
    return false;
  }

  if (connectPromise) {
    try {
      await connectPromise;
      const ok = mongoose.connection.readyState === 1;
      if (ok) lastMongoError = null;
      return ok;
    } catch (err) {
      lastMongoError = err.message;
      return false;
    }
  }

  try {
    connectPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    await connectPromise;
    isMongoConnected = true;
    lastMongoError = null;
    lastFailedConnectTime = 0;
    console.log('⚡ Connected to MongoDB Database successfully!');

    // Sync local sheets/users into MongoDB if database collections are empty
    try {
      const sheetCount = await SheetModel.countDocuments();
      if (sheetCount === 0) {
        console.log('🌱 MongoDB sheets collection empty: Syncing sheets into MongoDB Atlas.');
        let sheetsToSeed = DEFAULT_INITIAL_SHEETS;
        if (fs.existsSync(filePath)) {
          try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              sheetsToSeed = parsed;
            }
          } catch (e) {
            console.error('Error reading local backup for MongoDB seed:', e);
          }
        }
        await SheetModel.insertMany(sheetsToSeed);
        console.log(`✅ Seeded ${sheetsToSeed.length} sheets into MongoDB Atlas.`);
      }

      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        let usersToSeed = DEFAULT_INITIAL_USERS;
        if (fs.existsSync(usersFilePath)) {
          try {
            const raw = fs.readFileSync(usersFilePath, 'utf-8');
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              usersToSeed = parsed;
            }
          } catch (e) {
            console.error('Error reading local users backup for MongoDB seed:', e);
          }
        }
        await UserModel.insertMany(usersToSeed);
        console.log(`✅ Seeded ${usersToSeed.length} users into MongoDB Atlas.`);
      }

      await MetaModel.updateOne(
        { key: 'is_db_initialized' },
        { $set: { key: 'is_db_initialized', value: true } },
        { upsert: true }
      );
    } catch (syncErr) {
      console.warn('Warning during initial MongoDB sync:', syncErr.message);
    }

    return true;
  } catch (error) {
    isMongoConnected = false;
    lastMongoError = error.message;
    lastFailedConnectTime = Date.now();
    console.warn('⚠️ MongoDB connection error. Falling back to local JSON file storage:', error.message);
    return false;
  } finally {
    connectPromise = null;
  }
}

// 4. Fetch sheets from MongoDB (or Local JSON file fallback)
export async function getSheets() {
  ensureLocalDataFiles();
  const connected = await connectDB();

  if (connected || mongoose.connection.readyState === 1) {
    try {
      const sheetsFromDB = await SheetModel.find({}).lean();
      if (Array.isArray(sheetsFromDB)) {
        const cleaned = sheetsFromDB.map(({ _id, __v, ...rest }) => rest);
        try {
          fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2), 'utf-8');
        } catch (err) {
          console.error('Failed to update local backup file:', err);
        }
        return cleaned;
      }
    } catch (e) {
      console.warn('Error reading from MongoDB, returning local file data:', e.message);
    }
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INITIAL_SHEETS;
  }
}

// 5. Save/Update sheets to MongoDB (and Local JSON file backup)
export async function saveSheets(sheets) {
  ensureLocalDataFiles();

  if (!Array.isArray(sheets)) {
    throw new Error('Sheets payload must be an array');
  }

  try {
    fs.writeFileSync(filePath, JSON.stringify(sheets, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local backup file:', err);
  }

  const connected = await connectDB();
  if (connected || mongoose.connection.readyState === 1) {
    try {
      if (sheets.length === 0) {
        await SheetModel.deleteMany({});
      } else {
        const currentIds = sheets.map((s) => s.id);
        await SheetModel.deleteMany({ id: { $nin: currentIds } });

        const bulkOps = sheets.map((sheet) => ({
          updateOne: {
            filter: { id: sheet.id },
            update: { $set: sheet },
            upsert: true,
          },
        }));

        if (bulkOps.length > 0) {
          await SheetModel.bulkWrite(bulkOps);
        }
      }
      console.log(`✅ MongoDB Atlas: Saved ${sheets.length} sheets successfully.`);
      return true;
    } catch (e) {
      console.warn('Error saving to MongoDB, saved to local fallback:', e.message);
      return false;
    }
  }

  return true;
}

// ================= USER MANAGEMENT & AUTH FUNCTIONS =================

// 6. Fetch all users (passwords sanitized out except for auth check)
export async function getUsers() {
  ensureLocalDataFiles();
  const connected = await connectDB();

  if (connected && isMongoConnected) {
    try {
      const usersDB = await UserModel.find({}).lean();
      if (Array.isArray(usersDB) && usersDB.length > 0) {
        const cleaned = usersDB.map(({ _id, __v, ...rest }) => rest);
        try {
          fs.writeFileSync(usersFilePath, JSON.stringify(cleaned, null, 2), 'utf-8');
        } catch (err) {
          console.error('Failed to update local users backup file:', err);
        }
        return cleaned;
      }
    } catch (e) {
      console.warn('Error reading users from MongoDB:', e.message);
    }
  }

  try {
    const raw = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INITIAL_USERS;
  }
}

// 7. Save Users list
export async function saveUsers(users) {
  ensureLocalDataFiles();
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local users file:', err);
  }

  const connected = await connectDB();
  if (connected && isMongoConnected) {
    try {
      const bulkOps = users.map((user) => ({
        updateOne: {
          filter: { id: user.id },
          update: { $set: user },
          upsert: true,
        },
      }));

      const currentIds = users.map((u) => u.id);
      await UserModel.deleteMany({ id: { $nin: currentIds } });

      if (bulkOps.length > 0) {
        await UserModel.bulkWrite(bulkOps);
      }
    } catch (e) {
      console.warn('Error saving users to MongoDB:', e.message);
    }
  }
}

// 8. Authenticate User Login
export async function authenticateUser(username, password) {
  const users = await getUsers();
  const found = users.find(
    (u) =>
      u.username.trim().toLowerCase() === username.trim().toLowerCase() &&
      u.password === password
  );

  if (found) {
    const { password: _, ...userWithoutPassword } = found;
    return userWithoutPassword;
  }
  return null;
}

// 9. User CRUD helpers
export async function createUser(userData) {
  const users = await getUsers();
  if (users.some((u) => u.username.toLowerCase() === userData.username.toLowerCase())) {
    throw new Error('Username already exists');
  }

  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    username: userData.username.trim(),
    password: userData.password,
    fullName: userData.fullName.trim(),
    role: userData.role || 'staff',
    department: userData.department || 'General',
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  await saveUsers(updatedUsers);

  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

export async function updateUser(userId, updates) {
  const users = await getUsers();
  const updatedUsers = users.map((u) => {
    if (u.id === userId) {
      return {
        ...u,
        ...updates,
        password: updates.password ? updates.password : u.password,
      };
    }
    return u;
  });

  await saveUsers(updatedUsers);
  return updatedUsers;
}

export async function deleteUser(userId) {
  const users = await getUsers();
  const filtered = users.filter((u) => u.id !== userId);
  await saveUsers(filtered);
  return filtered;
}
