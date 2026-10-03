/**
 * Automated API Integration Test Suite for Expense Tracker Backend
 * 
 * Runs end-to-end integration tests against the running Express & PostgreSQL server.
 * Usage:
 *   1. Start the server (npm start)
 *   2. In another terminal, run: node test-api.js (or npm test)
 */

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

let passedTests = 0;
let failedTests = 0;

function logPass(title) {
  console.log(`  ${colors.green}✔ PASS:${colors.reset} ${title}`);
  passedTests++;
}

function logFail(title, error) {
  console.error(`  ${colors.red}✖ FAIL:${colors.reset} ${title}`);
  if (error) {
    console.error(`    ${colors.yellow}Details:${colors.reset}`, error);
  }
  failedTests++;
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return { status: response.status, data };
}

async function runTests() {
  console.log(`\n${colors.bold}${colors.cyan}======================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  Expense Tracker REST API Automated Test Suite       ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  Target: ${BASE_URL}                                ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}======================================================${colors.reset}\n`);

  let createdExpenseId = null;

  try {
    // 1. Health Check
    console.log(`${colors.bold}1. Health & Info Checks${colors.reset}`);
    try {
      const res = await request('/health');
      if (res.status === 200 && res.data.status === 'healthy') {
        logPass('GET /health returns 200 OK and status "healthy"');
      } else {
        logFail('GET /health returned invalid response', res);
      }
    } catch (err) {
      logFail('GET /health request failed', err.message);
    }

    // 2. GET /api/expenses
    console.log(`\n${colors.bold}2. Retrieve All Expenses${colors.reset}`);
    try {
      const res = await request('/api/expenses');
      if (res.status === 200 && Array.isArray(res.data)) {
        logPass(`GET /api/expenses returns 200 OK with ${res.data.length} records`);
      } else {
        logFail('GET /api/expenses did not return an array', res);
      }
    } catch (err) {
      logFail('GET /api/expenses failed', err.message);
    }

    // 3. POST /api/expenses (Valid Payload)
    console.log(`\n${colors.bold}3. Create Expense (POST)${colors.reset}`);
    try {
      const newExpense = {
        title: 'Automated Test Expense',
        amount: 49.99,
        category: 'Entertainment',
        date: '2026-09-30',
      };
      const res = await request('/api/expenses', {
        method: 'POST',
        body: JSON.stringify(newExpense),
      });

      if (res.status === 201 && res.data.id && res.data.title === newExpense.title) {
        createdExpenseId = res.data.id;
        logPass(`POST /api/expenses created expense with ID: ${createdExpenseId}`);
      } else {
        logFail('POST /api/expenses failed to create record', res);
      }
    } catch (err) {
      logFail('POST /api/expenses request error', err.message);
    }

    // 4. GET /api/expenses/:id
    console.log(`\n${colors.bold}4. Retrieve Single Expense (GET by ID)${colors.reset}`);
    if (createdExpenseId) {
      try {
        const res = await request(`/api/expenses/${createdExpenseId}`);
        if (res.status === 200 && res.data.id === createdExpenseId) {
          logPass(`GET /api/expenses/${createdExpenseId} retrieved correctly`);
        } else {
          logFail(`GET /api/expenses/${createdExpenseId} mismatch`, res);
        }
      } catch (err) {
        logFail(`GET /api/expenses/${createdExpenseId} failed`, err.message);
      }
    } else {
      logFail('Skipping GET by ID (no created ID from previous step)');
    }

    // 5. PUT /api/expenses/:id
    console.log(`\n${colors.bold}5. Update Expense (PUT by ID)${colors.reset}`);
    if (createdExpenseId) {
      try {
        const updateData = {
          title: 'Updated Test Expense Title',
          amount: 59.99,
          category: 'Food',
          date: '2026-09-30',
        };
        const res = await request(`/api/expenses/${createdExpenseId}`, {
          method: 'PUT',
          body: JSON.stringify(updateData),
        });

        if (res.status === 200 && res.data.title === updateData.title && Number(res.data.amount) === 59.99) {
          logPass(`PUT /api/expenses/${createdExpenseId} updated title and amount successfully`);
        } else {
          logFail(`PUT /api/expenses/${createdExpenseId} returned unexpected data`, res);
        }
      } catch (err) {
        logFail(`PUT /api/expenses/${createdExpenseId} failed`, err.message);
      }
    } else {
      logFail('Skipping PUT by ID (no created ID)');
    }

    // 6. Validation Error Checks (HTTP 400)
    console.log(`\n${colors.bold}6. Input Validation & Error Handling (HTTP 400)${colors.reset}`);
    try {
      // Missing title
      const res1 = await request('/api/expenses', {
        method: 'POST',
        body: JSON.stringify({ amount: 10, category: 'Food' }),
      });
      if (res1.status === 400) {
        logPass('POST /api/expenses without title rejected with 400 Bad Request');
      } else {
        logFail('POST /api/expenses without title did not return 400', res1);
      }

      // Negative amount
      const res2 = await request('/api/expenses', {
        method: 'POST',
        body: JSON.stringify({ title: 'Negative Amount Test', amount: -25, category: 'Food' }),
      });
      if (res2.status === 400) {
        logPass('POST /api/expenses with negative amount rejected with 400 Bad Request');
      } else {
        logFail('POST /api/expenses with negative amount did not return 400', res2);
      }

      // Invalid category
      const res3 = await request('/api/expenses', {
        method: 'POST',
        body: JSON.stringify({ title: 'Invalid Category', amount: 20, category: 'UnknownCategory' }),
      });
      if (res3.status === 400) {
        logPass('POST /api/expenses with invalid category rejected with 400 Bad Request');
      } else {
        logFail('POST /api/expenses with invalid category did not return 400', res3);
      }

      // Invalid Date format
      const res4 = await request('/api/expenses', {
        method: 'POST',
        body: JSON.stringify({ title: 'Invalid Date', amount: 20, category: 'Food', date: 'not-a-date' }),
      });
      if (res4.status === 400) {
        logPass('POST /api/expenses with invalid date format rejected with 400 Bad Request');
      } else {
        logFail('POST /api/expenses with invalid date format did not return 400', res4);
      }

      // Invalid ID parameter format
      const res5 = await request('/api/expenses/abc');
      if (res5.status === 400) {
        logPass('GET /api/expenses/abc with non-numeric ID rejected with 400 Bad Request');
      } else {
        logFail('GET /api/expenses/abc did not return 400', res5);
      }
    } catch (err) {
      logFail('Validation error checks failed', err.message);
    }

    // 7. Not Found Error Checks (HTTP 404)
    console.log(`\n${colors.bold}7. Not Found Handling (HTTP 404)${colors.reset}`);
    try {
      const res = await request('/api/expenses/99999999');
      if (res.status === 404) {
        logPass('GET /api/expenses/99999999 returned 404 Not Found');
      } else {
        logFail('GET /api/expenses/99999999 did not return 404', res);
      }
    } catch (err) {
      logFail('GET /api/expenses/99999999 failed', err.message);
    }

    // 8. DELETE /api/expenses/:id
    console.log(`\n${colors.bold}8. Delete Expense (DELETE by ID)${colors.reset}`);
    if (createdExpenseId) {
      try {
        const res = await request(`/api/expenses/${createdExpenseId}`, {
          method: 'DELETE',
        });
        if (res.status === 200) {
          logPass(`DELETE /api/expenses/${createdExpenseId} deleted successfully`);
        } else {
          logFail(`DELETE /api/expenses/${createdExpenseId} returned status ${res.status}`, res);
        }

        // Verify it is gone
        const verifyRes = await request(`/api/expenses/${createdExpenseId}`);
        if (verifyRes.status === 404) {
          logPass(`Verification: GET /api/expenses/${createdExpenseId} now returns 404 Not Found`);
        } else {
          logFail(`Verification failed: item ${createdExpenseId} still exists`, verifyRes);
        }
      } catch (err) {
        logFail(`DELETE /api/expenses/${createdExpenseId} failed`, err.message);
      }
    } else {
      logFail('Skipping DELETE (no created ID)');
    }

  } catch (globalErr) {
    console.error('\nUnexpected test execution error:', globalErr);
  } finally {
    console.log(`\n${colors.bold}${colors.cyan}======================================================${colors.reset}`);
    console.log(`  Test Summary: ${colors.green}${passedTests} passed${colors.reset}, ${failedTests > 0 ? colors.red : colors.green}${failedTests} failed${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}======================================================${colors.reset}\n`);

    if (failedTests > 0) {
      process.exit(1);
    }
  }
}

runTests();
