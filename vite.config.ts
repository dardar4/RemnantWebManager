import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

function remnantSavePlugin(): Plugin {
  return {
    name: 'remnant-save-plugin',
    configureServer(server) {
      server.middlewares.use('/api/local-saves', (_req, res) => {
        try {
          const localAppData = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Local');
          const saveDir = path.join(localAppData, 'Remnant', 'Saved', 'SaveGames');

          if (!fs.existsSync(saveDir)) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `Save directory not found at: ${saveDir}` }));
            return;
          }

          const fileList = fs.readdirSync(saveDir);
          const savFileNames = fileList.filter(
            (f) => f.toLowerCase() === 'profile.sav' || (f.toLowerCase().startsWith('save_') && f.toLowerCase().endsWith('.sav'))
          );

          const files = savFileNames.map((fileName) => {
            const filePath = path.join(saveDir, fileName);
            const buffer = fs.readFileSync(filePath);
            return {
              name: fileName,
              base64: buffer.toString('base64'),
            };
          });

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ path: saveDir, files }));
        } catch (err: unknown) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: (err as Error).message }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), remnantSavePlugin()],
});
