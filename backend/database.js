// Re-export services/database so imports from either '../database' or '../services/database' resolve identically
module.exports = require('./services/database');
