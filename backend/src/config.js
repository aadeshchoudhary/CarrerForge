const path = require('path');

module.exports = {
  PORT: process.env.PORT || 8000,
  JWT_SECRET: process.env.JWT_SECRET || 'careerforge-express-secret-key-2026-production-ready',
  JWT_EXPIRES_IN: '7d',
  CORS_ORIGINS: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://carrer-forge.vercel.app',
    'https://career-forge.vercel.app',
    '*',
  ],
  UPLOAD_DIR: process.env.VERCEL
    ? '/tmp/uploads'
    : path.join(__dirname, '..', 'uploads'),
};
