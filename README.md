# 💰 Full-Stack Expense Tracker System (متتبع المصاريف)

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express-4.19.2-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue.svg)](https://www.postgresql.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.3-purple.svg)](https://getbootstrap.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4.2-orange.svg)](https://www.chartjs.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

A complete, production-grade **Full-Stack Expense Tracker application** built with a decoupled architecture: an **Express.js & PostgreSQL** REST API on the backend and a modern, responsive **Vanilla JavaScript (ES6+), Bootstrap 5, CSS Grid, and Chart.js** interface on the frontend.

## Auth by Hamza Mahmood Sadeq Abdulrahman (hamc0d3r@gmail.com)
## GitHub Repo :
https://github.com/HamC0d3r/tracker-system


---

## 📑 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [Tech Stack & Tooling](#-tech-stack--tooling)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start Guide (Step-by-Step)](#-quick-start-guide-step-by-step)
  - [1. Database Setup](#1-database-setup)
  - [2. Environment Configuration](#2-environment-configuration)
  - [3. Install Backend Dependencies](#3-install-backend-dependencies)
  - [4. Start the Backend Server](#4-start-the-backend-server)
  - [5. Launch the Frontend Interface](#5-launch-the-frontend-interface)
- [RESTful API Reference](#-restful-api-reference)
- [Features & Implementation Roadmap](#-features--implementation-roadmap)
  - [Phase 0: Foundations & Mini-Tasks](#phase-0-foundations--mini-tasks)
  - [Phase 1: Backend Architecture & PostgreSQL](#phase-1-backend-architecture--postgresql)
  - [Phase 2: Modern Frontend Design & Layout](#phase-2-modern-frontend-design--layout)
  - [Phase 3: Full-Stack Integration & Dynamic Interactivity](#phase-3-full-stack-integration--dynamic-interactivity)
  - [Bonus & Value-Add Features](#bonus--value-add-features)
- [Architectural Decisions & Deep-Dive Solutions](#-architectural-decisions--deep-dive-solutions)
  - [1. PostgreSQL NUMERIC/DECIMAL Precision & Type Parsing](#1-postgresql-numericdecimal-precision--type-parsing)
  - [2. Timezone Shift Prevention for DATE Columns](#2-timezone-shift-prevention-for-date-columns)
  - [3. SQL Injection Immunity with Parameterized Queries](#3-sql-injection-immunity-with-parameterized-queries)
  - [4. Responsive CSS Grid for KPI Cards](#4-responsive-css-grid-for-kpi-cards)
  - [5. Decoupled API Service Layer](#5-decoupled-api-service-layer)
- [Testing & Quality Assurance](#-testing--quality-assurance)
  - [Automated API Integration Test Suite](#automated-api-integration-test-suite)
  - [Thunder Client / Postman Manual Testing](#thunder-client--postman-manual-testing)
- [Clean Submission & Git Hygiene](#-clean-submission--git-hygiene)
- [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🏛 Overview & Architecture

The application is structured into two completely decoupled layers communicating over standard HTTP/JSON REST APIs:

```
+-------------------------------------------------------------------------+
|                              CLIENT TIER                                |
|  Modern Web Browser (Vanilla JS ES6+ / HTML5 / CSS Grid / Bootstrap 5)  |
|                                                                         |
|  [Summary Cards]   [Add/Edit Form]   [Chart.js Visuals]   [Table/Filter]|
|         |                 |                  |                   |      |
|         +-----------------+------------------+-------------------+      |
|                                   |                                     |
|                          [api.js Client SDK]                            |
+-----------------------------------|-------------------------------------+
                                    | HTTP / JSON (CORS Enabled)
                                    v
+-------------------------------------------------------------------------+
|                              SERVER TIER                                |
|                   Node.js & Express.js REST API Server                  |
|                                                                         |
|  [CORS & BodyParser] -> [Route Validator Middleware] -> [Controllers]   |
|                                                              |          |
|                                                     [db.js Connection]  |
|                                                     [Pool & OID Parsers]|
+--------------------------------------------------------------|----------+
                                                               | SQL
                                                               v
+-------------------------------------------------------------------------+
|                             DATABASE TIER                               |
|                         PostgreSQL 14+ Server                           |
|                                                                         |
|  Table: `expenses` (id, title, amount NUMERIC, category, date DATE)    |
|  Indexes: `idx_expenses_date`, `idx_expenses_category`                  |
+-------------------------------------------------------------------------+
```

### Key Architectural Characteristics
- **Separation of Concerns:** Frontend contains zero database logic or secrets; Backend exposes standardized JSON REST endpoints.
- **Defensive Input Validation:** Inputs are validated both on the client (real-time UI feedback) and the server (middleware rejection with structured error messages).
- **High-Performance Database Layer:** Leverages connection pooling (`pg.Pool`) and custom PostgreSQL OID type parsers for decimal precision and timezone-safe date management.

---

## 🛠 Tech Stack & Tooling

### Frontend
- **HTML5 & Semantic Markup:** Accessible, clean structure with ARIA attributes.
- **CSS3 & Bootstrap 5.3.3:** Modern utility classes, CSS custom properties (variables), responsive layout.
- **CSS Grid:** Fluid dynamic KPI summary cards (`repeat(auto-fit, minmax(240px, 1fr))`).
- **Bootstrap Icons 1.11.3:** Sharp vector iconography for all financial actions.
- **Chart.js 4.4.2 (UMD):** Interactive, reactive doughnut chart visualizing expense category breakdown.
- **Vanilla JavaScript (ES6+):** Clean, modular code (`api.js`, `app.js`) without heavy framework overhead.

### Backend
- **Node.js (v18+):** High-performance asynchronous JavaScript runtime.
- **Express.js 4.19.2:** Robust HTTP web framework for REST API routing and middleware.
- **PostgreSQL (`pg` 8.12.0):** Native PostgreSQL client with connection pooling and parameterized query execution.
- **dotenv 16.4.5:** Environment variable management isolating configuration from source code.
- **cors 2.8.5:** Cross-Origin Resource Sharing middleware enabling flexible frontend hosting.

### Development & Testing Tools
- **VS Code & Live Server:** Rapid frontend development and hot reloading.
- **Thunder Client / Postman:** API endpoint validation and payload verification.
- **Built-in Node.js Test Runner / Script:** Automated integration test suite (`backend/test-api.js`).

---

## 📂 Project Directory Structure

```text
tracker-system/
├── .gitignore                      # Git ignore rules (node_modules, .env, OS artifacts)
├── package.json                    # Root package.json with unified helper scripts
├── README.md                       # Comprehensive documentation & setup guide
│
├── backend/                        # Backend REST API
│   ├── .env                        # Local environment variables (NOT committed to git)
│   ├── .env.example                # Template for environment configuration
│   ├── package.json                # Backend dependencies & npm scripts
│   ├── schema.sql                  # PostgreSQL table creation, indexes & seed data
│   ├── server.js                   # Express application initialization & middleware
│   ├── test-api.js                 # Automated end-to-end integration test suite
│   └── src/
│       ├── config/
│       │   └── db.js               # PostgreSQL Pool configuration & OID type parsers
│       ├── controllers/
│       │   └── expenseController.js# CRUD controller logic (SQL queries)
│       ├── middleware/
│       │   ├── errorHandler.js     # Centralized 500 & error catching middleware
│       │   └── validator.js        # Request body and route parameter validators
│       └── routes/
│           └── expenseRoutes.js    # REST route definitions for /api/expenses
│
├── frontend/                       # Frontend User Interface
│   ├── index.html                  # Single-page application markup & modals
│   ├── css/
│   │   └── style.css               # Custom CSS styles, CSS Grid, Dark Mode theme
│   └── js/
│       ├── api.js                  # Decoupled REST API Client module
│       └── app.js                  # UI controllers, state management, chart & filters
│
└── phase0-tasks/                   # Phase 0 Foundation Tasks
    ├── task1-fetch-cards/          # Mini Task 1: Fetch API + Bootstrap 5 Cards
    │   ├── index.html
    │   ├── style.css
    │   └── app.js
    ├── task2-express-json/         # Mini Task 2: Standalone Express Server returning JSON
    │   ├── package.json
    │   └── server.js
    └── task3-express-pg/           # Mini Task 3: Express + PostgreSQL parameterized queries
        ├── package.json
        └── server.js
```

---

## 📋 Prerequisites

Ensure you have the following installed on your machine before running the project:

1. **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
   - Verify: `node -v` and `npm -v`
2. **PostgreSQL**: `v14.0` or higher ([Download PostgreSQL](https://www.postgresql.org/download/))
   - Recommended GUI: **pgAdmin 4** (bundled with PostgreSQL installer) or DBeaver / TablePlus.
3. **Web Browser**: Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari.

---

## 🚀 Quick Start Guide (Step-by-Step)

Follow these 5 steps to get the entire application up and running from scratch.

### 1. Database Setup

1. Open **pgAdmin 4** (or open your terminal with `psql -U postgres`).
2. Create a new database named **`expense_tracker`**:
   ```sql
   CREATE DATABASE expense_tracker;
   ```
3. Connect to the `expense_tracker` database and execute the schema script located at [`backend/schema.sql`](file:///backend/schema.sql):
   - **Using pgAdmin 4 Query Tool:** Open Query Tool on `expense_tracker`, paste the contents of `backend/schema.sql`, and press **Execute (F5)**.
   - **Using psql Command Line:**
     ```bash
     psql -U postgres -d expense_tracker -f backend/schema.sql
     ```
4. This script creates the `expenses` table, indexes on `date` and `category`, and seeds 9 initial realistic records.

---

### 2. Environment Configuration

Navigate to the `backend/` directory:

1. Check the template file [`backend/.env.example`](file:///backend/.env.example):
   ```ini
   # Server Configuration
   PORT=3000

   # PostgreSQL Database Configuration
   PGUSER=postgres
   PGPASSWORD=postgres
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=expense_tracker
   ```
2. Create your local [`backend/.env`](file:///backend/.env) file (if not already present):
   ```bash
   # On Windows PowerShell:
   Copy-Item backend/.env.example backend/.env

   # On Linux / macOS:
   cp backend/.env.example backend/.env
   ```
3. Open `backend/.env` and update `PGUSER`, `PGPASSWORD`, `PGPORT`, and `PGHOST` to match your local PostgreSQL credentials.

---

### 3. Install Backend Dependencies

From the project root or inside `backend/`, install the required npm packages:

```bash
# Option A: From backend directory
cd backend
npm install

# Option B: From root directory
npm run setup:backend
```

---

### 4. Start the Backend Server

Start the Express backend server:

```bash
# Production Mode:
npm start

# Development / Watch Mode (Node 18+ auto-reload):
npm run dev
```

You should see output similar to:
```text
[Server] Expense Tracker API running on http://localhost:3000
[Server] Health check: http://localhost:3000/health
[Server] Expenses endpoint: http://localhost:3000/api/expenses
```

Verify backend health in your browser:
- `http://localhost:3000/health` &rarr; `{"status":"healthy","uptime":...}`
- `http://localhost:3000/api/expenses` &rarr; JSON array of seed expenses.

---

### 5. Launch the Frontend Interface

Because the frontend is built with clean Vanilla JS and standard HTML5, you have multiple ways to run it:

#### Option A: VS Code Live Server (Recommended)
1. Open the project root folder in **Visual Studio Code**.
2. Right-click on [`frontend/index.html`](file:///frontend/index.html).
3. Select **"Open with Live Server"**.
4. The application will open automatically at `http://127.0.0.1:5500/frontend/index.html`.

#### Option B: Direct Browser Open
Double-click [`frontend/index.html`](file:///frontend/index.html) or open it directly in any modern browser.

> [!TIP]
> The top navigation bar includes a **live server connection badge** (🟢 Online / 🔴 Disconnected). When the backend is active on port 3000, the badge glows green and expenses load instantly.

---

## 📡 RESTful API Reference

Base URL: `http://localhost:3000`

| HTTP Method | Endpoint | Description | Request Body | Success Status | Error Statuses |
|:---|:---|:---|:---|:---|:---|
| **GET** | `/health` | Server health check & uptime | None | `200 OK` | `500` |
| **GET** | `/api` | API directory & endpoint catalog | None | `200 OK` | `500` |
| **GET** | `/api/expenses` | Retrieve all expenses (sorted by date DESC) | None | `200 OK` | `500` |
| **GET** | `/api/expenses/:id` | Retrieve single expense by ID | None | `200 OK` | `400`, `404`, `500` |
| **POST** | `/api/expenses` | Create a new expense item | JSON Object | `201 Created` | `400`, `500` |
| **PUT** | `/api/expenses/:id` | Update an existing expense by ID | JSON Object | `200 OK` | `400`, `404`, `500` |
| **DELETE** | `/api/expenses/:id` | Delete an expense by ID | None | `200 OK` | `400`, `404`, `500` |

---

### API Schemas & Example Payloads

#### 1. Create Expense (`POST /api/expenses`)

**Request Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "title": "Weekly Grocery Shopping",
  "amount": 84.50,
  "category": "Food",
  "date": "2026-09-30"
}
```

**Validation Constraints:**
- `title`: String, required, trimmed length 1 to 255 chars.
- `amount`: Number, required, strictly greater than 0 (`amount > 0`).
- `category`: String, required, must be one of: `['Food', 'Transport', 'Bills', 'Entertainment', 'Other']`.
- `date`: String, optional (defaults to current date if omitted), format `YYYY-MM-DD`.

**Success Response (`201 Created`):**
```json
{
  "id": 10,
  "title": "Weekly Grocery Shopping",
  "amount": 84.5,
  "category": "Food",
  "date": "2026-09-30"
}
```

---

#### 2. Update Expense (`PUT /api/expenses/:id`)

**Request Parameters:** `id` (Positive Integer)

**Request Body:**
```json
{
  "title": "Monthly Electricity Bill",
  "amount": 125.00,
  "category": "Bills",
  "date": "2026-09-28"
}
```

**Success Response (`200 OK`):**
```json
{
  "id": 3,
  "title": "Monthly Electricity Bill",
  "amount": 125,
  "category": "Bills",
  "date": "2026-09-28"
}
```

---

#### 3. Error Response Format (HTTP 400 / 404 / 500)

Every error response follows a consistent, structured format:
```json
{
  "error": "Bad Request",
  "message": "Amount is required and must be a positive number greater than 0."
}
```

---

## 🎯 Features & Implementation Roadmap

### Phase 0: Foundations & Mini-Tasks
- [x] **Mini Task 1 (`phase0-tasks/task1-fetch-cards`):** Standalone app fetching public REST data (`JSONPlaceholder`) and dynamically rendering responsive Bootstrap 5 cards with live search filtering.
- [x] **Mini Task 2 (`phase0-tasks/task2-express-json`):** Standalone Express 4.x server with JSON headers, returning server diagnostics, memory stats, and uptime on `GET /api/info`.
- [x] **Mini Task 3 (`phase0-tasks/task3-express-pg`):** Express server integrated with PostgreSQL `pg` pool, utilizing parameterized queries (`$1, $2`), input validation, and structured error responses.

### Phase 1: Backend Architecture & PostgreSQL
- [x] **PostgreSQL Schema (`schema.sql`):** Table structure with `SERIAL PRIMARY KEY`, `NUMERIC(10,2)` check constraint, category enum constraint, and B-tree indexes on `date` and `category`.
- [x] **Database Connection Pooling (`src/config/db.js`):** Production-ready pool configuration with automatic idle connection cleanup and OID parsers.
- [x] **Controller-Route Architecture (`src/controllers`, `src/routes`):** Modular separation of routes, business logic, and error handlers.
- [x] **Input Validation Middleware (`src/middleware/validator.js`):** Sanitization of inputs, positive numeric checks, category whitelist verification, date regex validation, and ID parameter enforcement.
- [x] **Centralized Error Handling (`src/middleware/errorHandler.js`):** Handles PostgreSQL foreign key / unique errors, syntax errors, and unhandled exceptions gracefully.

### Phase 2: Modern Frontend Design & Layout
- [x] **Summary Cards Grid:** 3 dynamic cards (Total Spending, Total Records Count, Highest Single Expense) using **CSS Grid** with auto-fit wrapping.
- [x] **Responsive Form Card:** Sticky form for adding expenses with inline validation states (`is-valid` / `is-invalid`).
- [x] **Expenses History Table:** Striped, hoverable Bootstrap table displaying category badges, formatted currency, and actions.
- [x] **Loading & Empty States:** Animated spinners during asynchronous operations and clean placeholder UI when no expenses match search/filter criteria.

### Phase 3: Full-Stack Integration & Dynamic Interactivity
- [x] **Decoupled API Client (`frontend/js/api.js`):** Modular client handling all `fetch` requests, headers, and error normalization.
- [x] **Real-time Live Filter & Search:**
  - Search by expense title (instant keystroke matching).
  - Filter by category (`Food`, `Transport`, `Bills`, `Entertainment`, `Other`, `All`).
  - Filter by month (`YYYY-MM` picker).
  - One-click filter reset button.
- [x] **Interactive Modals:**
  - **Edit Modal:** Pre-populates selected expense data and sends `PUT /api/expenses/:id`.
  - **Delete Modal:** Modal confirmation dialog preventing accidental deletions before sending `DELETE /api/expenses/:id`.
- [x] **Toast & Alert Notification System:** Non-blocking feedback messages on successful additions, edits, and deletions.

### Bonus & Value-Add Features
- [x] 🌙 **Dark Mode / Light Mode Toggle:** Full dark theme support with persistent memory saved in `localStorage`.
- [x] 📊 **Interactive Chart.js Visualizer:** Responsive Doughnut chart automatically calculating category distribution and percentage shares in real time.
- [x] 📥 **CSV Export Utility:** Generates and downloads a clean, RFC-4180-compliant `.csv` spreadsheet file from current expenses.
- [x] 🟢 **Live Server Health Indicator:** Real-time polling badge in navigation displaying backend availability.
- [x] ⚡ **Interactive Column Sorting:** Clickable table headers (Title, Amount, Category, Date) with alternating Ascending/Descending indicators.

---

## 🧠 Architectural Decisions & Deep-Dive Solutions

### 1. PostgreSQL NUMERIC/DECIMAL Precision & Type Parsing

#### Problem
By default, the `node-postgres` (`pg`) driver parses PostgreSQL `NUMERIC` and `DECIMAL` columns (OID `1700`) as **strings** (e.g. `"84.50"` instead of `84.50`). PostgreSQL does this to prevent loss of precision in JavaScript 64-bit floating-point numbers. However, returning numbers as strings causes frontend calculations (e.g., `sum += expense.amount`) to perform string concatenation (`"84.50" + "65.00" = "84.5065.00"`).

#### Solution
Configured a global type parser in [`backend/src/config/db.js`](file:///backend/src/config/db.js):
```javascript
const { types } = require('pg');

// OID 1700 = NUMERIC / DECIMAL
types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val)));
```
This guarantees that all monetary amounts are automatically returned as native JavaScript numbers in every SQL query.

---

### 2. Timezone Shift Prevention for DATE Columns

#### Problem
When querying a `DATE` column (e.g., `'2026-09-30'`), `pg` instantiates a JavaScript `Date` object at midnight UTC (`2026-09-30T00:00:00.000Z`). When this is serialized into JSON on a server operating in a negative UTC offset (or formatted in the client's local timezone), the date shifts back by one full day to `'2026-09-29'`.

#### Solution
Implemented a two-tier protection strategy:
1. **Database Layer (SQL formatting):** All SQL queries use `TO_CHAR(date, 'YYYY-MM-DD') AS date`.
2. **Driver Layer (OID parser):** Configured OID `1082` (PostgreSQL DATE) to return the raw ISO string directly without constructing a `Date` object:
```javascript
// OID 1082 = DATE
types.setTypeParser(1082, (val) => val);
```
Result: The date `'2026-09-30'` remains invariant across all client and server timezones.

---

### 3. SQL Injection Immunity with Parameterized Queries

#### Problem
Concatenating user input into SQL queries (e.g. `SELECT * FROM expenses WHERE id = ' + id`) exposes the system to catastrophic SQL injection attacks.

#### Solution
All SQL executions across the backend use parameterized queries with `$1, $2, ...` placeholders:
```javascript
const queryText = `
  UPDATE expenses 
  SET title = $1, amount = $2, category = $3, date = $4 
  WHERE id = $5 
  RETURNING id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date;
`;
const values = [title, amount, category, expenseDate, id];
const result = await db.query(queryText, values);
```
Values are sent as separate parameters to the PostgreSQL engine protocol, making SQL injection mathematically impossible.

---

### 4. Responsive CSS Grid for KPI Cards

#### Problem
Traditional media-query-heavy column layouts require boilerplate breakpoints (`col-12 col-md-6 col-lg-4`) and often fail on intermediate container widths or foldable displays.

#### Solution
Implemented a pure CSS Grid layout in [`frontend/css/style.css`](file:///frontend/css/style.css):
```css
.summary-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}
```
`repeat(auto-fit, minmax(240px, 1fr))` automatically computes how many 240px+ cards fit in the viewport width and stretches them proportionally to fill remaining space seamlessly.

---

### 5. Decoupled API Service Layer

#### Problem
Embedding raw `fetch()` calls directly in DOM event listeners creates tight coupling, duplicated error handling, and hard-to-maintain code.

#### Solution
Encapsulated all HTTP communication inside [`frontend/js/api.js`](file:///frontend/js/api.js) via the `ExpenseAPI` singleton:
- Centralized base URL configuration.
- Unified response parser extracting structured error messages from server payloads.
- Graceful offline and connection failure detection.

---

## 🧪 Testing & Quality Assurance

### Automated API Integration Test Suite

The project includes an automated end-to-end integration test suite in [`backend/test-api.js`](file:///backend/test-api.js) that validates all CRUD routes and error conditions against a running instance.

#### How to run:
1. Ensure the backend server is running (`npm start` in `backend/`).
2. Run the test script:
   ```bash
   # From root directory:
   npm test

   # Or from backend directory:
   cd backend && npm test
   ```

#### Test Execution Coverage:
```text
======================================================
  Expense Tracker REST API Automated Test Suite       
  Target: http://localhost:3000                       
======================================================

1. Health & Info Checks
  ✔ PASS: GET /health returns 200 OK and status "healthy"

2. Retrieve All Expenses
  ✔ PASS: GET /api/expenses returns 200 OK with 9 records

3. Create Expense (POST)
  ✔ PASS: POST /api/expenses created expense with ID: 10

4. Retrieve Single Expense (GET by ID)
  ✔ PASS: GET /api/expenses/10 retrieved correctly

5. Update Expense (PUT by ID)
  ✔ PASS: PUT /api/expenses/10 updated title and amount successfully

6. Input Validation & Error Handling (HTTP 400)
  ✔ PASS: POST /api/expenses without title rejected with 400 Bad Request
  ✔ PASS: POST /api/expenses with negative amount rejected with 400 Bad Request
  ✔ PASS: POST /api/expenses with invalid category rejected with 400 Bad Request
  ✔ PASS: POST /api/expenses with invalid date format rejected with 400 Bad Request
  ✔ PASS: GET /api/expenses/abc with non-numeric ID rejected with 400 Bad Request

7. Not Found Handling (HTTP 404)
  ✔ PASS: GET /api/expenses/99999999 returned 404 Not Found

8. Delete Expense (DELETE by ID)
  ✔ PASS: DELETE /api/expenses/10 deleted successfully
  ✔ PASS: Verification: GET /api/expenses/10 now returns 404 Not Found

======================================================
  Test Summary: 13 passed, 0 failed
======================================================
```

---

### Thunder Client / Postman Manual Testing

You can easily test the endpoints using VS Code's **Thunder Client** extension or **Postman**:

#### Sample POST Request
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/expenses`
- **Header:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "title": "Cloud Server Hosting",
    "amount": 29.99,
    "category": "Bills",
    "date": "2026-09-30"
  }
  ```

#### Sample PUT Request
- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/expenses/1`
- **Header:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "title": "Weekly Organic Grocery",
    "amount": 95.20,
    "category": "Food",
    "date": "2026-09-24"
  }
  ```

#### Sample DELETE Request
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/api/expenses/1`

---

## 🧹 Clean Submission & Git Hygiene

The repository is configured with a strict root [`.gitignore`](file:///.gitignore) to ensure no sensitive files or heavy dependencies are committed:

- `node_modules/` - Excluded (installed fresh via `npm install`).
- `.env` - Excluded (secrets isolated; `.env.example` committed as reference).
- `*.log` - Excluded.
- `.DS_Store` / `Thumbs.db` - Excluded.

Before sharing or submitting:
```bash
# Verify no untracked secrets or build artifacts exist:
git status
```

---

## ❓ Troubleshooting & FAQ

### Q1: Server fails to start with `ECONNREFUSED 127.0.0.1:5432`
**Cause:** PostgreSQL service is not running or credentials in `.env` are incorrect.  
**Fix:**
1. Open Windows Services (`services.msc`) or terminal and ensure `postgresql-x64-XX` service is running.
2. Verify `PGUSER`, `PGPASSWORD`, and `PGPORT` in `backend/.env`.

### Q2: Frontend shows "Unable to connect to server" (Red Badge)
**Cause:** The Express backend is not running on port 3000.  
**Fix:** Start the server with `cd backend && npm start`. Refresh the frontend page once the server reports `running on http://localhost:3000`.

### Q3: Adding an expense gives 400 Bad Request
**Cause:** One of the input fields failed validation constraints (e.g., negative amount or non-standard category).  
**Fix:** Ensure title is not empty, amount is greater than 0, and category is selected from the dropdown list.

### Q4: Port 3000 is already in use (`EADDRINUSE`)
**Cause:** Another application is occupying port 3000.  
**Fix:** In `backend/.env`, change `PORT=3000` to `PORT=3001` (or another free port), and update `API_CONFIG.BASE_URL` in `frontend/js/api.js` to match.

---

## 📄 License

This project is licensed under the [ISC License](file:///backend/package.json).
