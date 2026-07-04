const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AI Resume Analyzer API is running.' });
});

const PORT = process.env.PORT || 5000;

initDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
