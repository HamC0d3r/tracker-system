const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const pg = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

pg.types.setTypeParser(1700, (val) => parseFloat(val));
pg.types.setTypeParser(1082, (val) => val);

const dbConfig = {
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT, 10) || 5432,
  database: process.env.PGDATABASE || 'expense_tracker',
};

let pool = new Pool(dbConfig);

async function initDatabase() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected successfully');
  } catch (err) {
    if (err.code === '3D000' || (err.message && err.message.includes('does not exist'))) {
      console.log('Database expense_tracker does not exist. Creating it automatically...');
      const adminPool = new Pool({
        user: dbConfig.user,
        password: dbConfig.password,
        host: dbConfig.host,
        port: dbConfig.port,
        database: 'postgres',
      });

      try {
        await adminPool.query('CREATE DATABASE expense_tracker;');
        console.log('Database expense_tracker created successfully');
      } catch (createErr) {
        console.error('Could not auto-create database:', createErr.message);
      } finally {
        await adminPool.end();
      }

      pool = new Pool(dbConfig);
    } else {
      console.error('Database connection error:', err.message);
      return;
    }
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
        category VARCHAR(50) NOT NULL CHECK (category IN ('Food', 'Transport', 'Bills', 'Entertainment', 'Other')),
        date DATE NOT NULL DEFAULT CURRENT_DATE
      );
    `);

    const countRes = await pool.query('SELECT COUNT(*) FROM expenses;');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.log('Seeding initial expense records...');
      await pool.query(`
        INSERT INTO expenses (title, amount, category, date) VALUES
        ('Weekly Grocery Shopping', 84.50, 'Food', '2026-09-24'),
        ('Monthly Public Transit Pass', 65.00, 'Transport', '2026-09-25'),
        ('Electricity & Water Utility Bill', 118.75, 'Bills', '2026-09-26'),
        ('Weekend Movie & Popcorn', 27.50, 'Entertainment', '2026-09-27'),
        ('High-Speed Fiber Internet', 55.00, 'Bills', '2026-09-27'),
        ('Ride Share to Airport', 32.40, 'Transport', '2026-09-28'),
        ('Team Dinner at Italian Bistro', 48.90, 'Food', '2026-09-29'),
        ('Music & Video Streaming Subscriptions', 21.98, 'Entertainment', '2026-09-30'),
        ('Ergonomic Laptop Stand', 39.99, 'Other', '2026-09-30');
      `);
      console.log('Initial seed data inserted successfully');
    }
  } catch (schemaErr) {
    console.error('Schema initialization error:', schemaErr.message);
  }
}

initDatabase();

const ALLOWED_CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', message: 'Server is running' });
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to Expense Tracker API' });
});

app.get('/api/expenses', async (req, res) => {
  try {
    const query = `
      SELECT id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date
      FROM expenses
      ORDER BY date DESC, id DESC;
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching expenses:', err.message);
    res.status(500).json({ message: 'Internal server error while fetching expenses' });
  }
});

app.get('/api/expenses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid expense ID' });
    }

    const query = `
      SELECT id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date
      FROM expenses
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `Expense with ID ${id} not found` });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching expense:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ message: 'Expense title is required and cannot be empty' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a number greater than 0' });
    }

    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: `Invalid category. Allowed categories are: ${ALLOWED_CATEGORIES.join(', ')}`,
      });
    }

    const expenseDate = date && String(date).trim() !== '' ? String(date).trim() : new Date().toISOString().split('T')[0];

    const query = `
      INSERT INTO expenses (title, amount, category, date)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date;
    `;
    const values = [title.trim(), numericAmount, category, expenseDate];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating expense:', err.message);
    res.status(500).json({ message: 'Internal server error while creating expense' });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid expense ID' });
    }

    const { title, amount, category, date } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ message: 'Expense title is required' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a number greater than 0' });
    }

    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: `Invalid category. Allowed categories: ${ALLOWED_CATEGORIES.join(', ')}`,
      });
    }

    if (!date || String(date).trim() === '') {
      return res.status(400).json({ message: 'Date is required' });
    }

    const query = `
      UPDATE expenses
      SET title = $1, amount = $2, category = $3, date = $4
      WHERE id = $5
      RETURNING id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date;
    `;
    const values = [title.trim(), numericAmount, category, String(date).trim(), id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `Expense with ID ${id} not found` });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error updating expense:', err.message);
    res.status(500).json({ message: 'Internal server error while updating expense' });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid expense ID' });
    }

    const query = `
      DELETE FROM expenses
      WHERE id = $1
      RETURNING id;
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `Expense with ID ${id} not found` });
    }

    res.status(200).json({ message: 'Expense deleted successfully', id: id });
  } catch (err) {
    console.error('Error deleting expense:', err.message);
    res.status(500).json({ message: 'Internal server error while deleting expense' });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found (404 Not Found)' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
    console.log(`Expenses endpoint: http://localhost:${PORT}/api/expenses`);
  });
}

module.exports = app;
