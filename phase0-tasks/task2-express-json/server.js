/**
 * Phase 0 Mini Task 2: Standalone Express Server Returning JSON
 *
 * Demonstrates:
 * - Express server initialization
 * - Proper HTTP headers (Content-Type: application/json)
 * - Returning structured JSON on GET /api/info
 * - Route handling and 404 responses
 */

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001;

// Built-in JSON middleware
app.use(express.json());

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Phase 0 Task 2: Express JSON Server is Running',
    endpoint: '/api/info',
  });
});

/**
 * GET /api/info
 * Returns application metadata, environment details, and server status in JSON format
 */
app.get('/api/info', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      application: 'Expense Tracker Backend System',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: process.platform,
      serverTime: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsage: {
        rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
      },
      features: [
        'RESTful API architecture',
        'PostgreSQL with pg Pool connection',
        'Strict input validation & parameterization',
        'CORS support',
      ],
    },
  });
});

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Task 2] Express JSON server listening on http://localhost:${PORT}`);
    console.log(`[Task 2] Test endpoint: http://localhost:${PORT}/api/info`);
  });
}

module.exports = app;
