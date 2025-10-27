// Servidor simples para servir o frontend em produção/desenvolvimento
// Uso: node server.js

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const PORT = process.env.PORT || 8080;
const MODE = process.env.NODE_ENV || 'development';

// Log
console.log(`🚀 Starting ${MODE} server on port ${PORT}`);

// Servir arquivos estáticos da pasta dist
app.use(express.static(join(__dirname, 'dist')));

// Fallback para index.html (necessário para SPA routing)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${join(__dirname, 'dist')}`);
});

