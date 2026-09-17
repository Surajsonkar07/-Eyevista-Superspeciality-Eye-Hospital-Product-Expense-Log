import fs from 'fs';

let inMemorySheets = null;

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const tmpPath = '/tmp/sheets.json';

  const getSheets = () => {
    if (fs.existsSync(tmpPath)) {
      try {
        return JSON.parse(fs.readFileSync(tmpPath, 'utf-8'));
      } catch (e) {
        console.error(e);
      }
    }
    if (inMemorySheets) return inMemorySheets;

    return [
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
          {
            id: 'prod-2',
            productName: 'Moxifloxacin Eye Drops 10ml',
            price: 2400,
            additionalInfo: 'Micro Labs - Exp 2027',
            timestamp: new Date().toISOString(),
            date: '17 Sep 2026',
            time: '09:15 AM',
            category: 'Pharmacy',
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
  };

  if (req.method === 'GET') {
    return res.status(200).json(getSheets());
  }

  if (req.method === 'POST') {
    try {
      const sheets = req.body;
      inMemorySheets = sheets;
      try {
        fs.writeFileSync(tmpPath, JSON.stringify(sheets, null, 2));
      } catch (e) {
        console.error(e);
      }
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
