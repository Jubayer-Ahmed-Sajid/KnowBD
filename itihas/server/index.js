const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ─── Express app ────────────────────────────────────────────────
const app = express();

// ─── Global middleware ──────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS — allow the Vite dev server and any CLIENT_URL in production
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// HTTP request logging (skip in production for less noise)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiting — 100 requests per 15-minute window per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests — please try again later.',
  },
});
app.use('/api', limiter);

// ─── API Routes ─────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/places', require('./routes/places'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));

// Health-check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'itihas API is running 🇧🇩',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 404 fallback for unknown /api/* paths
app.all('/api/*', (_req, res) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

// ─── Global error handler (must be last) ────────────────────────
app.use(errorHandler);

// ─── Start server in development ────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;

  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(
        `\x1b[36mServer running on http://localhost:${PORT}\x1b[0m`
      );
    });
  });
}

module.exports = app;
