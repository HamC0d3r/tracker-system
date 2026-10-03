/**
 * Centralized Express Error Handling Middleware
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('[Server Error]', {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });

  // Handle JSON parse errors from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid JSON payload in request body.',
    });
  }

  // Handle database integrity or specific error codes if needed
  if (err.code === '23514') {
    // Check constraint violation
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Database check constraint failed: invalid expense data.',
    });
  }

  // Default internal server error response
  return res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred on the server.',
  });
};

module.exports = errorHandler;
