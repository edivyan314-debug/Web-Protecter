const express = require('express');
const cors = require('cors');
require('dotenv').config();

const analyzeRoutes = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for local frontend-backend communication
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
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
