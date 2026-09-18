import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

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

// Vite Middleware plugin to provide cross-user persistent shared API for sheets & users
function sheetsApiPlugin(): Plugin {
  return {
    name: 'sheets-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // DB Status API
        if (url === '/api/db-status' || url.startsWith('/api/db-status')) {
          res.setHeader('Content-Type', 'application/json');
          await connectDB();
          res.statusCode = 200;
          res.end(JSON.stringify(getDbStatus()));
          return;
        }

        // 1. Sheets API
        if (url === '/api/sheets' || url.startsWith('/api/sheets')) {
          res.setHeader('Content-Type', 'application/json');

          if (req.method === 'GET') {
            try {
              const sheets = await getSheets();
              res.statusCode = 200;
              res.end(JSON.stringify(sheets));
            } catch (e) {
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
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body);
                await saveSheets(parsed);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, count: parsed.length }));
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON payload or save failed' }));
              }
            });
            return;
          }
        }

        // 2. Auth Login API
        if (url === '/api/auth/login' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');
          let body = '';
          req.on('data', (chunk) => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const { username, password } = JSON.parse(body);
              const user = await authenticateUser(username, password);
              if (user) {
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, user }));
              } else {
                res.statusCode = 401;
                res.end(JSON.stringify({ error: 'Invalid username or password' }));
              }
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Server authentication error' }));
            }
          });
          return;
        }

        // 3. User Management API
        if (url === '/api/users' || url.startsWith('/api/users')) {
          res.setHeader('Content-Type', 'application/json');

          if (req.method === 'GET') {
            try {
              const users = await getUsers();
              const sanitized = users.map(({ password, ...u }) => u);
              res.statusCode = 200;
              res.end(JSON.stringify(sanitized));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to fetch users' }));
            }
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk.toString();
            });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body);
                const newUser = await createUser(parsed);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, user: newUser }));
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: e.message || 'Failed to create user' }));
              }
            });
            return;
          }

          if (req.method === 'PUT') {
            const parts = url.split('/');
            const id = parts[parts.length - 1];
            let body = '';
            req.on('data', (chunk) => {
              body += chunk.toString();
            });
            req.on('end', async () => {
              try {
                const updates = JSON.parse(body);
                const updated = await updateUser(id, updates);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, count: updated.length }));
              } catch (e) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to update user' }));
              }
            });
            return;
          }

          if (req.method === 'DELETE') {
            const parts = url.split('/');
            const id = parts[parts.length - 1];
            try {
              const updated = await deleteUser(id);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, count: updated.length }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to delete user' }));
            }
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
      watch: {
        ignored: ['**/server/data/**', '**/server/data/*.json'],
      },
    },
  };
});
