const ALLOWED_CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

/**
 * Helper to validate YYYY-MM-DD date format and calendar validity
 * @param {string} dateString
 * @returns {boolean}
 */
const isValidDateString = (dateString) => {
  if (typeof dateString !== 'string') return false;
  
  // Format check: YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const [year, month, day] = dateString.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);

  return (
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day
  );
};

/**
 * Middleware to validate expense payload on POST and PUT requests
 */
const validateExpense = (req, res, next) => {
  const { title, amount, category, date } = req.body;

  // 1. Title validation: required, non-empty trimmed string, max 255 chars
  if (
    title === undefined ||
    title === null ||
    typeof title !== 'string' ||
    title.trim().length === 0
  ) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Title is required and must be a non-empty string.',
    });
  }

  if (title.trim().length > 255) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Title must not exceed 255 characters.',
    });
  }

  // 2. Amount validation: required, positive numeric value > 0
  const parsedAmount = Number(amount);
  if (
    amount === undefined ||
    amount === null ||
    amount === '' ||
    Number.isNaN(parsedAmount) ||
    !Number.isFinite(parsedAmount) ||
    parsedAmount <= 0
  ) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Amount is required and must be a positive number greater than 0.',
    });
  }

  // 3. Category validation: required, must be within allowed set
  if (
    !category ||
    typeof category !== 'string' ||
    !ALLOWED_CATEGORIES.includes(category.trim())
  ) {
    return res.status(400).json({
      error: 'Bad Request',
      message: `Category is required and must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`,
    });
  }

  // 4. Date validation: optional, but if provided must be valid YYYY-MM-DD
  if (date !== undefined && date !== null && date !== '') {
    if (!isValidDateString(date)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Date must be a valid date in YYYY-MM-DD format.',
      });
    }
  }

  // Normalize trimmed and parsed values onto req.body for controller consumption
  req.body.title = title.trim();
  req.body.amount = Number(parsedAmount.toFixed(2));
  req.body.category = category.trim();
  if (date && typeof date === 'string' && date.trim().length > 0) {
    req.body.date = date.trim();
  }

  next();
};

/**
 * Middleware to validate :id route parameter
 */
const validateId = (req, res, next) => {
  const { id } = req.params;

  // Must be an integer string and strictly positive
  const isPositiveInteger = /^[1-9]\d*$/.test(id);
  const parsedId = parseInt(id, 10);

  if (!isPositiveInteger || Number.isNaN(parsedId) || parsedId > 2147483647) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Expense ID must be a valid positive integer.',
    });
  }

  // Store parsed ID for controller
  req.params.id = parsedId;
  next();
};

module.exports = {
  validateExpense,
  validateId,
  ALLOWED_CATEGORIES,
};
