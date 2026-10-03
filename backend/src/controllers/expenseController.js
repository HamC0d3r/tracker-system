const db = require('../config/db');

/**
 * Controller containing CRUD operations for Expenses
 */
const expenseController = {
  /**
   * GET /api/expenses
   * Retrieve all expenses sorted by date descending, then id descending
   */
  async getAllExpenses(req, res, next) {
    try {
      const queryText = `
        SELECT 
          id, 
          title, 
          amount, 
          category, 
          TO_CHAR(date, 'YYYY-MM-DD') AS date 
        FROM expenses 
        ORDER BY date DESC, id DESC;
      `;
      const result = await db.query(queryText);
      return res.status(200).json(result.rows);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * GET /api/expenses/:id
   * Retrieve a single expense by ID using parameterized query
   */
  async getExpenseById(req, res, next) {
    try {
      const { id } = req.params;
      const queryText = `
        SELECT 
          id, 
          title, 
          amount, 
          category, 
          TO_CHAR(date, 'YYYY-MM-DD') AS date 
        FROM expenses 
        WHERE id = $1;
      `;
      const result = await db.query(queryText, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Expense with ID ${id} not found`,
        });
      }

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /api/expenses
   * Create a new expense item using parameterized query
   */
  async createExpense(req, res, next) {
    try {
      const { title, amount, category, date } = req.body;
      const expenseDate = date || new Date().toISOString().split('T')[0];

      const queryText = `
        INSERT INTO expenses (title, amount, category, date) 
        VALUES ($1, $2, $3, $4) 
        RETURNING 
          id, 
          title, 
          amount, 
          category, 
          TO_CHAR(date, 'YYYY-MM-DD') AS date;
      `;
      const values = [title, amount, category, expenseDate];
      const result = await db.query(queryText, values);

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * PUT /api/expenses/:id
   * Update an existing expense by ID using parameterized query
   */
  async updateExpense(req, res, next) {
    try {
      const { id } = req.params;
      const { title, amount, category, date } = req.body;
      const expenseDate = date || new Date().toISOString().split('T')[0];

      const queryText = `
        UPDATE expenses 
        SET 
          title = $1, 
          amount = $2, 
          category = $3, 
          date = $4 
        WHERE id = $5 
        RETURNING 
          id, 
          title, 
          amount, 
          category, 
          TO_CHAR(date, 'YYYY-MM-DD') AS date;
      `;
      const values = [title, amount, category, expenseDate, id];
      const result = await db.query(queryText, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Expense with ID ${id} not found`,
        });
      }

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * DELETE /api/expenses/:id
   * Delete an expense by ID using parameterized query
   */
  async deleteExpense(req, res, next) {
    try {
      const { id } = req.params;
      const queryText = `
        DELETE FROM expenses 
        WHERE id = $1 
        RETURNING id;
      `;
      const result = await db.query(queryText, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Expense with ID ${id} not found`,
        });
      }

      return res.status(200).json({
        message: 'Expense deleted successfully',
        id: result.rows[0].id,
      });
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = expenseController;
