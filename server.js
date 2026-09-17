import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const dataDir = path.resolve(__dirname, 'server/data');
const filePath = path.join(dataDir, 'sheets.json');

const ensureDataFile = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    const initialSheets = [
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
    fs.writeFileSync(filePath, JSON.stringify(initialSheets, null, 2), 'utf-8');
  }
};

app.get('/api/sheets', (req, res) => {
  try {
    ensureDataFile();
    const data = fs.readFileSync(filePath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch sheets' });
  }
});

app.post('/api/sheets', (req, res) => {
  try {
    ensureDataFile();
    const sheets = req.body;
    if (!Array.isArray(sheets)) {
      return res.status(400).json({ error: 'Payload must be an array of sheets' });
    }
    fs.writeFileSync(filePath, JSON.stringify(sheets, null, 2), 'utf-8');
    res.json({ success: true, count: sheets.length });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save sheets' });
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
