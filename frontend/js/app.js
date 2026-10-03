const API_URL = 'http://localhost:3000/api/expenses';

let allExpenses = [];
let currentFilter = 'All';
let searchQuery = '';
let myChart = null;
let reconnectTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('expense-date').value = today;

  loadExpenses();
  setupEventListeners();
  loadSavedTheme();
});

function setupEventListeners() {
  const addForm = document.getElementById('add-expense-form');
  addForm.addEventListener('submit', handleAddExpense);

  const categoryFilter = document.getElementById('filter-category');
  categoryFilter.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    applyFilters();
  });

  const searchInput = document.getElementById('filter-search');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    applyFilters();
  });

  document.getElementById('reset-filters-btn').addEventListener('click', resetFilters);
  document.getElementById('empty-reset-btn').addEventListener('click', () => {
    resetFilters();
    loadExpenses();
  });
  document.getElementById('export-csv-btn').addEventListener('click', exportToCSV);
  document.getElementById('dark-mode-toggle').addEventListener('click', toggleTheme);
  document.getElementById('edit-expense-form').addEventListener('submit', handleEditExpense);
}

async function loadExpenses() {
  showSpinner(true);

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const data = await response.json();
    allExpenses = Array.isArray(data) ? data : [];

    if (reconnectTimer) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }

    hideAlert();
    updateServerStatus(true);
    updateSummaryCards(allExpenses);
    applyFilters();

  } catch (error) {
    updateServerStatus(false);
    showAlert('Cannot connect to server. Please ensure backend is running (cd backend && npm start).', 'danger', false);
    
    allExpenses = [];
    updateSummaryCards([]);
    renderTable([]);

    if (!reconnectTimer) {
      reconnectTimer = setInterval(() => {
        loadExpenses();
      }, 5000);
    }
  } finally {
    showSpinner(false);
  }
}

function updateSummaryCards(expenses) {
  let total = 0;
  for (let i = 0; i < expenses.length; i++) {
    total += parseFloat(expenses[i].amount) || 0;
  }

  const count = expenses.length;

  let max = 0;
  if (expenses.length > 0) {
    const amounts = expenses.map(item => parseFloat(item.amount) || 0);
    max = Math.max(...amounts);
  }

  document.getElementById('summary-total-amount').innerText = `$${total.toFixed(2)}`;
  document.getElementById('summary-total-count').innerText = count;
  document.getElementById('summary-max-amount').innerText = `$${max.toFixed(2)}`;
}

function applyFilters() {
  let filtered = allExpenses;

  if (currentFilter !== 'All') {
    filtered = filtered.filter(item => item.category === currentFilter);
  }

  if (searchQuery !== '') {
    filtered = filtered.filter(item => item.title.toLowerCase().includes(searchQuery));
  }

  renderTable(filtered);
  renderChart(filtered);
}

function resetFilters() {
  currentFilter = 'All';
  searchQuery = '';
  document.getElementById('filter-category').value = 'All';
  document.getElementById('filter-search').value = '';
  applyFilters();
}

function renderTable(expenses) {
  const tbody = document.getElementById('expenses-table-body');
  const emptyState = document.getElementById('table-empty-state');
  const countBadge = document.getElementById('filtered-count-badge');

  countBadge.innerText = `${expenses.length} ${expenses.length === 1 ? 'record' : 'records'}`;

  if (expenses.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('d-none');
    return;
  }

  emptyState.classList.add('d-none');

  const categoryBadges = {
    'Food': 'bg-warning text-dark',
    'Transport': 'bg-info text-dark',
    'Bills': 'bg-danger text-white',
    'Entertainment': 'bg-primary text-white',
    'Other': 'bg-secondary text-white'
  };

  let rowsHtml = '';
  expenses.forEach(item => {
    const badgeClass = categoryBadges[item.category] || 'bg-secondary text-white';
    const amountFormatted = parseFloat(item.amount).toFixed(2);

    rowsHtml += `
      <tr>
        <td class="ps-3 fw-medium">${escapeHtml(item.title)}</td>
        <td class="text-end fw-bold text-primary">$${amountFormatted}</td>
        <td class="text-center">
          <span class="badge ${badgeClass} px-3 py-2 rounded-pill">
            ${item.category}
          </span>
        </td>
        <td class="text-center text-muted">${item.date}</td>
        <td class="text-center pe-3">
          <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(${item.id})">
            <i class="bi bi-pencil"></i> Edit
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteExpense(${item.id})">
            <i class="bi bi-trash"></i> Delete
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = rowsHtml;
}

async function handleAddExpense(event) {
  event.preventDefault();

  const titleInput = document.getElementById('expense-title');
  const amountInput = document.getElementById('expense-amount');
  const categoryInput = document.getElementById('expense-category');
  const dateInput = document.getElementById('expense-date');

  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!title) {
    showAlert('Please enter an expense title', 'warning');
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    showAlert('Please enter a valid amount greater than 0', 'warning');
    return;
  }
  if (!category) {
    showAlert('Please select a category', 'warning');
    return;
  }
  if (!date) {
    showAlert('Please select a date', 'warning');
    return;
  }

  const newExpense = { title, amount, category, date };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExpense)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add expense');
    }

    showAlert('Expense added successfully!', 'success');

    document.getElementById('add-expense-form').reset();
    document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];

    await loadExpenses();

  } catch (error) {
    console.error('Error adding expense:', error);
    showAlert(error.message, 'danger');
  }
}

function openEditModal(id) {
  const expense = allExpenses.find(item => item.id === id);
  if (!expense) return;

  document.getElementById('edit-expense-id').value = expense.id;
  document.getElementById('edit-expense-title').value = expense.title;
  document.getElementById('edit-expense-amount').value = expense.amount;
  document.getElementById('edit-expense-category').value = expense.category;
  document.getElementById('edit-expense-date').value = expense.date;

  const modalElement = document.getElementById('edit-expense-modal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.show();
}

async function handleEditExpense(event) {
  event.preventDefault();

  const id = document.getElementById('edit-expense-id').value;
  const title = document.getElementById('edit-expense-title').value.trim();
  const amount = parseFloat(document.getElementById('edit-expense-amount').value);
  const category = document.getElementById('edit-expense-category').value;
  const date = document.getElementById('edit-expense-date').value;

  if (!title || isNaN(amount) || amount <= 0 || !category || !date) {
    showAlert('Please fill in all fields correctly', 'warning');
    return;
  }

  const updatedData = { title, amount, category, date };

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update expense');
    }

    const modalElement = document.getElementById('edit-expense-modal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();

    showAlert('Expense updated successfully!', 'success');
    await loadExpenses();

  } catch (error) {
    console.error('Error updating expense:', error);
    showAlert(error.message, 'danger');
  }
}

async function deleteExpense(id) {
  const isConfirmed = confirm('Are you sure you want to delete this expense?');
  if (!isConfirmed) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete expense');
    }

    showAlert('Expense deleted successfully!', 'success');
    await loadExpenses();

  } catch (error) {
    console.error('Error deleting expense:', error);
    showAlert(error.message, 'danger');
  }
}

function renderChart(expenses) {
  const chartCanvas = document.getElementById('expense-chart');
  const chartEmpty = document.getElementById('chart-empty-state');

  if (!chartCanvas) return;

  if (expenses.length === 0) {
    chartCanvas.style.display = 'none';
    if (chartEmpty) chartEmpty.classList.remove('d-none');
    return;
  }

  chartCanvas.style.display = 'block';
  if (chartEmpty) chartEmpty.classList.add('d-none');

  const totals = { Food: 0, Transport: 0, Bills: 0, Entertainment: 0, Other: 0 };
  expenses.forEach(item => {
    if (totals[item.category] !== undefined) {
      totals[item.category] += parseFloat(item.amount) || 0;
    } else {
      totals['Other'] += parseFloat(item.amount) || 0;
    }
  });

  const labels = Object.keys(totals).filter(cat => totals[cat] > 0);
  const data = labels.map(cat => totals[cat]);
  const colors = ['#f59e0b', '#0284c7', '#ef4444', '#8b5cf6', '#0d9488'];

  if (myChart) {
    myChart.destroy();
  }

  const ctx = chartCanvas.getContext('2d');
  myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function exportToCSV() {
  if (allExpenses.length === 0) {
    showAlert('No expenses to export', 'warning');
    return;
  }

  let csvContent = 'ID,Title,Amount,Category,Date\n';
  allExpenses.forEach(item => {
    csvContent += `${item.id},"${item.title}",${item.amount},${item.category},${item.date}\n`;
  });

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function showAlert(message, type = 'info', autoDismiss = true) {
  const container = document.getElementById('alert-container');
  container.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show shadow-sm d-flex align-items-center justify-content-between" role="alert">
      <div>
        <strong>${type === 'danger' ? 'Error: ' : type === 'success' ? 'Success: ' : ''}</strong>${escapeHtml(message)}
      </div>
      <div class="d-flex align-items-center gap-2 ms-3">
        ${type === 'danger' ? '<button class="btn btn-sm btn-outline-light" onclick="loadExpenses()">Retry</button>' : ''}
        <button type="button" class="btn-close ${type === 'danger' ? 'btn-close-white' : ''}" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    </div>
  `;

  if (autoDismiss) {
    setTimeout(() => {
      hideAlert();
    }, 5000);
  }
}

function hideAlert() {
  const container = document.getElementById('alert-container');
  if (container) container.innerHTML = '';
}

function showSpinner(show) {
  const spinner = document.getElementById('table-loading-spinner');
  if (!spinner) return;
  if (show) {
    spinner.classList.remove('d-none');
  } else {
    spinner.classList.add('d-none');
  }
}

function updateServerStatus(isOnline) {
  const badge = document.getElementById('server-status-badge');
  const text = document.getElementById('server-status-text');
  if (!badge || !text) return;

  if (isOnline) {
    badge.className = 'badge rounded-pill bg-success-subtle text-success border border-success';
    text.innerText = 'Online';
  } else {
    badge.className = 'badge rounded-pill bg-danger-subtle text-danger border border-danger';
    text.innerText = 'Offline';
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-bs-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-bs-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-bs-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (!icon) return;
  if (theme === 'dark') {
    icon.className = 'bi bi-sun-fill text-warning';
  } else {
    icon.className = 'bi bi-moon-stars-fill';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
