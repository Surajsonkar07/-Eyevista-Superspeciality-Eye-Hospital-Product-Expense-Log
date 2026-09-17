import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

// Vite Middleware plugin to provide cross-user persistent shared API for sheets
function sheetsApiPlugin(): Plugin {
  const dataDir = path.resolve(__dirname, 'server/data');
  const filePath = path.join(dataDir, 'sheets.json');

  const ensureDataFile = () => {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      // Default initial sheets
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
            {
              id: 'prod-2',
              productName: 'Moxifloxacin Eye Drops 10ml (Box of 10)',
              price: 2400,
              additionalInfo: 'Supplier: Micro Labs - Exp 2027',
              timestamp: new Date().toISOString(),
              date: '17 Sep 2026',
              time: '09:15 AM',
              category: 'Pharmacy',
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
            }
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

  return {
    name: 'sheets-api-plugin',
    configureServer(server) {
      ensureDataFile();

      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/sheets' || req.url?.startsWith('/api/sheets')) {
          res.setHeader('Content-Type', 'application/json');

          if (req.method === 'GET') {
            try {
              ensureDataFile();
              const raw = fs.readFileSync(filePath, 'utf-8');
              res.statusCode = 200;
              res.end(raw);
            } catch {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to read sheets' }));
            }
            return;
          }

          if (req.method === 'POST' || req.method === 'PUT') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                ensureDataFile();
                fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf-8');
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, count: parsed.length }));
              } catch {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
              }
            });
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), sheetsApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
