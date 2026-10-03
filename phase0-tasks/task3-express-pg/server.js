/**
 * Phase 0 Mini Task 3: Express + PostgreSQL (`pg`) Parameterized Queries & Error Handling
 *
 * Demonstrates:
 * - PostgreSQL connection pool initialization using `pg`
 * - Safe, injection-proof parameterized queries ($1, $2, ...)
 * - Type parsing for PostgreSQL NUMERIC types
 * - Input validation & HTTP 400 bad request handling
 * - Clean HTTP 404 not found and 500 error handling
 */

const express = require('express');
const { Pool, types } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Parse numeric types as JavaScript floats
types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val)));

// PostgreSQL Pool instance
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT, 10) || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'expense_tracker',
  connectionTimeoutMillis: 3000,
});

pool.on('error', (err) => {
  console.error('[Database Pool Error]:', err.message);
});

// Middleware
app.use(express.json());

// Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: 'Phase 0 Task 3: Express + pg Parameterized Queries Demo',
    endpoints: [
      'GET /api/items',
      'GET /api/items/:id',
      'POST /api/items',
    ],
  });
});

/**
 * GET /api/items
 * Retrieve all items
 */
app.get('/api/items', async (req, res, next) => {
  try {
    const queryText = 'SELECT id, title, amount, category FROM expenses ORDER BY id ASC LIMIT 50;';
    const result = await pool.query(queryText);
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/items/:id
 * Retrieve a single item by ID using safe parameterized query ($1)
 */
app.get('/api/items/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID parameter
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'The item ID must be a valid positive integer.',
      });
    }

    // Parameterized query using $1
    const queryText = 'SELECT id, title, amount, category FROM expenses WHERE id = $1;';
    const values = [parsedId];
    const result = await pool.query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Item with ID ${parsedId} not found.`,
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /api/items
 * Insert a new item using safe parameterized queries ($1, $2, $3)
 */
app.post('/api/items', async (req, res, next) => {
  try {
    const { title, amount, category } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Title is required.',
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Amount must be a positive number greater than 0.',
      });
    }

    if (!category || typeof category !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Category is required.',
      });
    }

    // Parameterized INSERT query ($1, $2, $3)
    const queryText = `
      INSERT INTO expenses (title, amount, category) 
      VALUES ($1, $2, $3) 
      RETURNING id, title, amount, category;
    `;
    const values = [title.trim(), parsedAmount, category.trim()];
    const result = await pool.query(queryText, values);

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Centralized Error Handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Error Handler Caught]:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Database operation failed',
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Task 3] Express + pg server running on http://localhost:${PORT}`);
    console.log(`[Task 3] Test query endpoint: http://localhost:${PORT}/api/items`);
  });
}

module.exports = app;
