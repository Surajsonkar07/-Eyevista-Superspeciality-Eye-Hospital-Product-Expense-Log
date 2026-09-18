import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  connectDB,
  getDbStatus,
  getSheets,
  saveSheets,
  getUsers,
  authenticateUser,
  createUser,
  updateUser,
  deleteUser,
} from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Initialize MongoDB connection on server boot
connectDB();

// DB Status check
app.get('/api/db-status', async (req, res) => {
  await connectDB();
  res.json(getDbStatus());
});

// --- SHEETS ROUTES ---
app.get('/api/sheets', async (req, res) => {
  try {
    const data = await getSheets();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch sheets' });
  }
});

app.post('/api/sheets', async (req, res) => {
  try {
    const sheets = req.body;
    if (!Array.isArray(sheets)) {
      return res.status(400).json({ error: 'Payload must be an array of sheets' });
    }
    await saveSheets(sheets);
    res.json({ success: true, count: sheets.length });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save sheets' });
  }
});

// --- AUTH & USER MANAGEMENT ROUTES ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = await authenticateUser(username, password);
    if (user) {
      return res.json({ success: true, user });
    }
    return res.status(401).json({ error: 'Invalid username or password' });
  } catch (e) {
    res.status(500).json({ error: 'Authentication server error' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await getUsers();
    // Return sanitized users
    const sanitized = users.map(({ password, ...u }) => u);
    res.json(sanitized);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, password, fullName, role, department } = req.body;
    if (!username || !password || !fullName) {
      return res.status(400).json({ error: 'Username, password, and Full Name are required' });
    }
    const newUser = await createUser({ username, password, fullName, role, department });
    res.json({ success: true, user: newUser });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Failed to create user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedUsers = await updateUser(id, updates);
    res.json({ success: true, count: updatedUsers.length });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUsers = await deleteUser(id);
    res.json({ success: true, count: updatedUsers.length });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Serve dist static assets in production
const distDir = path.resolve(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Eyevista Expense Dashboard server running on port ${PORT}`);
});


