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

// Router for all API routes (allows mounting with or without /api prefix)
const apiRouter = express.Router();

// DB Status check
apiRouter.get('/db-status', async (req, res) => {
  await connectDB();
  res.json(getDbStatus());
});

// --- SHEETS ROUTES ---
apiRouter.get('/sheets', async (req, res) => {
  try {
    const data = await getSheets();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch sheets' });
  }
});

apiRouter.post('/sheets', async (req, res) => {
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
apiRouter.post('/auth/login', async (req, res) => {
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

apiRouter.get('/users', async (req, res) => {
  try {
    const users = await getUsers();
    // Return sanitized users
    const sanitized = users.map(({ password, ...u }) => u);
    res.json(sanitized);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

apiRouter.post('/users', async (req, res) => {
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

apiRouter.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedUsers = await updateUser(id, updates);
    res.json({ success: true, count: updatedUsers.length });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

apiRouter.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUsers = await deleteUser(id);
    res.json({ success: true, count: updatedUsers.length });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Mount router on both /api and / to seamlessly support direct calls and rewrites
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Serve dist static assets in local production (not in Vercel serverless where Vercel CDN serves static assets)
if (!process.env.VERCEL) {
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
}

export default app;


