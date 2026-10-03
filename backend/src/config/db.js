const { Pool, types } = require('pg');
require('dotenv').config();

// Parse PostgreSQL NUMERIC/DECIMAL (OID 1700) as JavaScript float instead of string
types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val)));

// Parse PostgreSQL DATE (OID 1082) as raw 'YYYY-MM-DD' string to avoid timezone shifts
types.setTypeParser(1082, (val) => val);

// Initialize PostgreSQL connection pool with environment configuration
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT, 10) || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'expense_tracker',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5s if connection cannot be established
});

// Clean event listeners for connection lifecycle
pool.on('connect', () => {
  // Client connected successfully
});

pool.on('error', (err) => {
  console.error('[Database Pool Error] Unexpected idle client error:', err.message);
});

/**
 * Execute parameterized queries safely
 * @param {string} text - SQL query string with parameter placeholders ($1, $2, etc.)
 * @param {Array} params - Array of parameter values
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => {
  return pool.query(text, params);
};

module.exports = {
  pool,
  query,
};
