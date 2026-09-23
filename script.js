// =========================================
// EXPENSES
// =========================================

const expenseList = document.getElementById("expenseList");
const openExpenseModal = document.getElementById("openExpenseModal");
const closeExpenseModal = document.getElementById("closeExpenseModal");
const expenseModal = document.getElementById("expenseModal");
const expenseFilter = document.getElementById("expenseFilter");
const expenseSearch = document.getElementById("expenseSearch");

const transCount = document.getElementById("transCount");
const dailySpending = document.getElementById("dailySpending");
const monthlySpending = document.getElementById("monthlySpending");
const totalExpenses = document.getElementById("totalExpenses");
const highestExpense = document.getElementById("highestExpense");
const categoryBreakdownList = document.getElementById("categoryBreakdownList");

const expenseModalTitle = document.getElementById("expenseModalTitle");
const expenseModalSubtitle = document.getElementById("expenseModalSubtitle");
const expenseSubmitText = document.getElementById("expenseSubmitText");

const expenseForm = document.getElementById("expenseForm");
const expenseNameInput = document.getElementById("expenseName");
const expenseAmountInput = document.getElementById("expenseAmount");
const expenseCategoryInput = document.getElementById("expenseCategory");
const expenseDateInput = document.getElementById("expenseDate");
const expenseNotesInput = document.getElementById("expenseNotes");
const toastContainer = document.getElementById("toastContainer");

let expensesarr = loadExpenses();
let editingExpenseId = null;

const categoryIcons = {
  food: "fa-utensils",
  transport: "fa-bus",
  education: "fa-graduation-cap",
  bills: "fa-file-invoice-dollar",
  shopping: "fa-bag-shopping",
  entertainment: "fa-film",
  health: "fa-heart-pulse",
  other: "fa-ellipsis",
};

const categoryColors = {
  food: "#f59e0b",
  transport: "#3b82f6",
  education: "#8b5cf6",
  bills: "#ef4444",
  shopping: "#ec4899",
  entertainment: "#06b6d4",
  health: "#10b981",
  other: "#64748b",
};

const categoryLabels = {
  food: "Food",
  transport: "Transportation",
  education: "Education",
  bills: "Bills",
  shopping: "Shopping",
  entertainment: "Entertainment",
  health: "Health",
  other: "Other",
};

function loadExpenses() {
  try {
    const saved = JSON.parse(localStorage.getItem("expensesarr") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    showToast("Saved expense data could not be read.", "error");
    return [];
  }
}

function formatMoney(amount) {
  const value = Number(amount) || 0;
  return `₦${value.toLocaleString("en-NG", {
    minimumFractionDigits: value % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

function getTodayDate() {
  const today = new Date();
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

function parseDateParts(dateString) {
  const [year, month, day] = String(dateString || "").split("-").map(Number);
  return { year, month, day };
}

function isToday(dateString) {
  return dateString === getTodayDate();
}

function isThisMonth(dateString) {
  const parts = parseDateParts(dateString);
  const today = new Date();

  return (
    parts.year === today.getFullYear() &&
    parts.month === today.getMonth() + 1
  );
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "status");

  toast.innerHTML = `
    <i class="fa-solid ${type === "error" ? "fa-circle-xmark" : "fa-circle-check"}"></i>
    <span>${escapeHTML(message)}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-hide");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function saveExpenses() {
  localStorage.setItem("expensesarr", JSON.stringify(expensesarr));
  window.dispatchEvent(new Event("budgetUpdated"));
}

function getTotals(excludedId = null) {
  return expensesarr.reduce(
    (totals, expense) => {
      if (String(expense.id) === String(excludedId)) return totals;

      const amount = Number(expense.amount) || 0;
      totals.total += amount;

      if (isToday(expense.date)) totals.daily += amount;
      if (isThisMonth(expense.date)) totals.monthly += amount;

      return totals;
    },
    { total: 0, daily: 0, monthly: 0 },
  );
}

function getLimits() {
  return {
    daily: Number(localStorage.getItem("dailyLimit")) || 0,
    monthly: Number(localStorage.getItem("monthlyLimit")) || 0,
  };
}

function showLimitWarning(totals, amount, date) {
  const limits = getLimits();
  const messages = [];

  if (limits.daily > 0 && date === getTodayDate()) {
    const dailyTotal = totals.daily + amount;
    if (dailyTotal > limits.daily) {
      messages.push(
        `Daily limit exceeded by ${formatMoney(dailyTotal - limits.daily)}.`,
      );
    }
  }

  if (limits.monthly > 0 && isThisMonth(date)) {
    const monthlyTotal = totals.monthly + amount;
    if (monthlyTotal > limits.monthly) {
      messages.push(
        `Monthly limit exceeded by ${formatMoney(monthlyTotal - limits.monthly)}.`,
      );
    }
  }

  return messages;
}

function validateExpense(name, amount, category, date, notes) {
  if (!name) return "Enter an expense name.";
  if (name.length > 80) return "Expense name must be 80 characters or fewer.";
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Enter an amount greater than ₦0.";
  }
  if (amount > 999999999) return "Enter a realistic expense amount.";
  if (!category || !categoryLabels[category]) return "Select a valid category.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Select a valid date.";
  if (date > getTodayDate()) return "Expense date cannot be in the future.";
  if (notes.length > 250) return "Notes must be 250 characters or fewer.";

  return "";
}

function openAddExpenseModal() {
  editingExpenseId = null;
  expenseForm.reset();
  expenseDateInput.value = getTodayDate();

  expenseModalTitle.textContent = "Add Expense";
  expenseModalSubtitle.textContent = "Record a new expense.";
  expenseSubmitText.textContent = "Add Expense";

  expenseModal.classList.add("show");
  setTimeout(() => expenseNameInput.focus(), 50);
}

function openEditExpenseModal(id) {
  const expense = expensesarr.find((item) => String(item.id) === String(id));
  if (!expense) return;

  editingExpenseId = expense.id;

  expenseNameInput.value = expense.name || "";
  expenseAmountInput.value = expense.amount || "";
  expenseCategoryInput.value = expense.category || "";
  expenseDateInput.value = expense.date || getTodayDate();
  expenseNotesInput.value = expense.notes || "";

  expenseModalTitle.textContent = "Edit Expense";
  expenseModalSubtitle.textContent = "Update the details of this expense.";
  expenseSubmitText.textContent = "Save Changes";

  expenseModal.classList.add("show");
  setTimeout(() => expenseNameInput.focus(), 50);
}

function closeExpenseModalFunc() {
  expenseModal.classList.remove("show");
  editingExpenseId = null;
  expenseForm.reset();
}

function renderExpenses(expensesToRender) {
  expenseList.innerHTML = "";

  if (expensesToRender.length === 0) {
    const hasFilters =
      expenseFilter.value !== "all" || expenseSearch.value.trim() !== "";

    expenseList.innerHTML = `
      <div class="expenses-empty">
        <div class="expenses-empty-icon">
          <i class="fa-solid ${hasFilters ? "fa-filter-circle-xmark" : "fa-receipt"}"></i>
        </div>
        <h3>${hasFilters ? "No matching expenses" : "No expenses yet"}</h3>
        <p>${
          hasFilters
            ? "Try a different search or category."
            : "Add your first expense to start tracking your spending."
        }</p>
        ${
          hasFilters
            ? `<button type="button" class="clear-expense-filter" id="clearExpenseFilter">Clear filters</button>`
            : ""
        }
      </div>
    `;
    return;
  }

  const sorted = [...expensesToRender].sort((a, b) => {
    const dateCompare = String(b.date).localeCompare(String(a.date));
    if (dateCompare !== 0) return dateCompare;
    return String(b.id).localeCompare(String(a.id));
  });

  sorted.forEach((expense) => {
    const category = categoryLabels[expense.category]
      ? expense.category
      : "other";
    const icon = categoryIcons[category];
    const color = categoryColors[category];
    const label = categoryLabels[category];

    const item = document.createElement("article");
    item.className = "expenses-list";

    const notes = expense.notes
      ? `<p class="expense-notes">${escapeHTML(expense.notes)}</p>`
      : "";

    item.innerHTML = `
      <div class="expense-info">
        <div class="expense-icon" style="background: ${color}1a; color: ${color};">
          <i class="fa-solid ${icon}"></i>
        </div>

        <div class="expense-details">
          <h3>${escapeHTML(expense.name)}</h3>
          <div class="expense-meta">
            <span class="expense-category">${label}</span>
            <span class="expense-date-text">${escapeHTML(expense.date)}</span>
          </div>
          ${notes}
        </div>

        <strong class="expense-amount">${formatMoney(expense.amount)}</strong>

        <div class="expense-actions-group">
          <button type="button" class="expense-action-btn edit-expense-btn"
            data-id="${escapeHTML(expense.id)}" aria-label="Edit ${escapeHTML(expense.name)}">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button type="button" class="expense-action-btn delete-expense-btn"
            data-id="${escapeHTML(expense.id)}" aria-label="Delete ${escapeHTML(expense.name)}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;

    expenseList.appendChild(item);
  });
}

function updateExpenseList() {
  const selectedCategory = expenseFilter.value;
  const searchText = expenseSearch.value.toLowerCase().trim();

  const filtered = expensesarr.filter((expense) => {
    const name = String(expense.name || "").toLowerCase();
    const notes = String(expense.notes || "").toLowerCase();
    const category = String(expense.category || "");

    return (
      (selectedCategory === "all" || category === selectedCategory) &&
      (name.includes(searchText) || notes.includes(searchText))
    );
  });

  renderExpenses(filtered);
}

function updateSummary() {
  const totals = getTotals();

  const highest = expensesarr.reduce(
    (max, expense) => Math.max(max, Number(expense.amount) || 0),
    0,
  );

  dailySpending.textContent = formatMoney(totals.daily);
  monthlySpending.textContent = formatMoney(totals.monthly);
  totalExpenses.textContent = formatMoney(totals.total);
  highestExpense.textContent = formatMoney(highest);
  transCount.textContent = expensesarr.length.toLocaleString("en-NG");
}

function updateCategoryBreakdown() {
  const breakdown = {};

  expensesarr.forEach((expense) => {
    const category = categoryLabels[expense.category]
      ? expense.category
      : "other";
    breakdown[category] =
      (breakdown[category] || 0) + (Number(expense.amount) || 0);
  });

  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, entry) => sum + entry[1], 0);

  categoryBreakdownList.innerHTML = "";

  if (!entries.length) {
    categoryBreakdownList.innerHTML =
      '<p class="category-breakdown-empty">No spending data yet.</p>';
    return;
  }

  entries.forEach(([category, amount]) => {
    const icon = categoryIcons[category];
    const color = categoryColors[category];
    const label = categoryLabels[category];
    const percent = total > 0 ? (amount / total) * 100 : 0;

    const row = document.createElement("div");
    row.className = "category-breakdown-item";

    row.innerHTML = `
      <div class="category-breakdown-info">
        <div class="category-breakdown-icon" style="background: ${color}1a; color: ${color};">
          <i class="fa-solid ${icon}"></i>
        </div>
        <div class="category-breakdown-name">
          <span>${label}</span>
          <strong>${formatMoney(amount)}</strong>
        </div>
        <span class="category-breakdown-percent">${Math.round(percent)}%</span>
      </div>
      <div class="category-breakdown-bar">
        <div class="category-breakdown-bar-fill"
          style="width: ${percent}%; background: ${color};"></div>
      </div>
    `;

    categoryBreakdownList.appendChild(row);
  });
}

function refreshExpensesUI() {
  expensesarr = loadExpenses();
  updateExpenseList();
  updateSummary();
  updateCategoryBreakdown();
}

openExpenseModal.addEventListener("click", openAddExpenseModal);
closeExpenseModal.addEventListener("click", closeExpenseModalFunc);

expenseModal.addEventListener("click", (event) => {
  if (event.target === expenseModal) closeExpenseModalFunc();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && expenseModal.classList.contains("show")) {
    closeExpenseModalFunc();
  }
});

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = expenseNameInput.value.trim();
  const amount = Number(expenseAmountInput.value);
  const category = expenseCategoryInput.value;
  const date = expenseDateInput.value;
  const notes = expenseNotesInput.value.trim();

  const validationMessage = validateExpense(name, amount, category, date, notes);

  if (validationMessage) {
    showToast(validationMessage, "error");
    return;
  }

  if (editingExpenseId !== null) {
    const index = expensesarr.findIndex(
      (expense) => String(expense.id) === String(editingExpenseId),
    );

    if (index === -1) {
      showToast("That expense no longer exists.", "error");
      closeExpenseModalFunc();
      refreshExpensesUI();
      return;
    }

    const totalsWithoutCurrent = getTotals(editingExpenseId);

    expensesarr[index] = {
      ...expensesarr[index],
      name,
      amount,
      category,
      date,
      notes,
    };

    saveExpenses();
    closeExpenseModalFunc();
    refreshExpensesUI();

    const warnings = showLimitWarning(totalsWithoutCurrent, amount, date);
    showToast("Expense updated successfully.");

    warnings.forEach((warning) => {
      setTimeout(() => showToast(warning, "error"), 150);
    });

    return;
  }

  const totals = getTotals();
  const expense = {
    id: createId(),
    name,
    amount,
    category,
    date,
    notes,
    createdAt: new Date().toISOString(),
  };

  expensesarr.push(expense);
  saveExpenses();
  closeExpenseModalFunc();
  refreshExpensesUI();

  const warnings = showLimitWarning(totals, amount, date);
  showToast("Expense added successfully.");

  warnings.forEach((warning) => {
    setTimeout(() => showToast(warning, "error"), 150);
  });
});

expenseList.addEventListener("click", (event) => {
  const clearButton = event.target.closest("#clearExpenseFilter");
  if (clearButton) {
    expenseFilter.value = "all";
    expenseSearch.value = "";
    updateExpenseList();
    return;
  }

  const button = event.target.closest(".expense-action-btn");
  if (!button) return;

  const id = button.dataset.id;

  if (button.classList.contains("edit-expense-btn")) {
    openEditExpenseModal(id);
    return;
  }

  if (button.classList.contains("delete-expense-btn")) {
    const expense = expensesarr.find(
      (item) => String(item.id) === String(id),
    );

    if (!expense) {
      showToast("That expense no longer exists.", "error");
      refreshExpensesUI();
      return;
    }

    const confirmed = window.confirm(
      `Delete "${expense.name}" for ${formatMoney(expense.amount)}?`,
    );

    if (!confirmed) return;

    expensesarr = expensesarr.filter(
      (item) => String(item.id) !== String(id),
    );

    saveExpenses();
    refreshExpensesUI();
    showToast("Expense deleted.");
  }
});

expenseFilter.addEventListener("change", updateExpenseList);
expenseSearch.addEventListener("input", updateExpenseList);

window.addEventListener("budgetUpdated", refreshExpensesUI);
window.addEventListener("storage", (event) => {
  if (
    !event.key ||
    event.key === "expensesarr" ||
    event.key === "dailyLimit" ||
    event.key === "monthlyLimit" ||
    event.key === "received"
  ) {
    refreshExpensesUI();
  }
});

refreshExpensesUI();
