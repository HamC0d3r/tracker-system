const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { validateExpense, validateId } = require('../middleware/validator');

/**
 * @route   GET /api/expenses
 * @desc    Retrieve all expenses
 * @access  Public
 */
router.get('/', expenseController.getAllExpenses);

/**
 * @route   GET /api/expenses/:id
 * @desc    Retrieve a single expense by ID
 * @access  Public
 */
router.get('/:id', validateId, expenseController.getExpenseById);

/**
 * @route   POST /api/expenses
 * @desc    Create a new expense
 * @access  Public
 */
router.post('/', validateExpense, expenseController.createExpense);

/**
 * @route   PUT /api/expenses/:id
 * @desc    Update an existing expense by ID
 * @access  Public
 */
router.put('/:id', validateId, validateExpense, expenseController.updateExpense);

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete an expense by ID
 * @access  Public
 */
router.delete('/:id', validateId, expenseController.deleteExpense);

module.exports = router;
