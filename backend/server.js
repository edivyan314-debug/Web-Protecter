const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./database');
const analyzeRoutes = require('./routes/analyze');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for local and production frontend-backend communication
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/$/, '')] : [])
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Web Protector Backend',
    timestamp: new Date().toISOString()
  });
});

// Mount analysis and history routes
app.use('/api', analyzeRoutes);

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start listening
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🛡️  Web Protector backend running on http://localhost:${PORT}`);
    console.log(`📡 Endpoints available:`);
    console.log(`   - POST   /api/analyze`);
    console.log(`   - GET    /api/history`);
    console.log(`   - DELETE /api/history/:id`);
    console.log(`   - GET    /api/health`);
  });
}

module.exports = app;
