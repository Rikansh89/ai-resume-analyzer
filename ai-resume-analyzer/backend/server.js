const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'AI Resume Analyzer API is running.' });
});

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'frontend', 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get(/^\/(?!api\/).*/, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await initDB();
  return app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (require.main === module) {
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL: JWT_SECRET must be set in production.');
      process.exit(1);
    }
    console.warn('WARNING: JWT_SECRET is not set. Using an insecure development secret. Set JWT_SECRET before deploying.');
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret';
  }

  start().catch((error) => {
    console.error('Failed to initialize database:', error.message);
    process.exit(1);
  });
}

module.exports = { app, start };
