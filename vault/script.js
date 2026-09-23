// =========================================
// DOM ELEMENTS
// =========================================

const addExpenseBtn = document.getElementById("add");
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

const expenseModalTitle = document.getElementById("expenseModalTitle");
const expenseModalSubtitle = document.getElementById("expenseModalSubtitle");
const expenseSubmitText = document.getElementById("expenseSubmitText");

const expenseNameInput = document.getElementById("expenseName");
const expenseAmountInput = document.getElementById("expenseAmount");
const expenseCategoryInput = document.getElementById("expenseCategory");
const expenseDateInput = document.getElementById("expenseDate");
const expenseNotesInput = document.getElementById("expenseNotes");

const toastContainer = document.getElementById("toastContainer");

const categoryBreakdownList = document.getElementById("categoryBreakdownList");

// =========================================
// STATE
// =========================================

let expensesarr = JSON.parse(localStorage.getItem("expensesarr")) || [];
let editingExpenseId = null;

// =========================================
// CATEGORY CONFIG
// =========================================

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

// =========================================
// HELPERS
// =========================================

function formatMoney(amount) {
  return `₦${Number(amount).toLocaleString()}`;
}

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type || "success"}`;

  const icon = type === "error" ? "fa-circle-xmark" : "fa-circle-check";

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(function () {
    toast.classList.add("toast-hide");

    setTimeout(function () {
      toast.remove();
    }, 300);
  }, 3000);
}

// =========================================
// MODAL HELPERS
// =========================================

function openAddExpenseModal() {
  editingExpenseId = null;

  expenseModalTitle.textContent = "Add Expense";
  expenseModalSubtitle.textContent = "Record a new expense.";
  expenseSubmitText.textContent = "Add Expense";

  expenseForm.reset();
  expenseDateInput.value = getTodayDate();

  expenseModal.classList.add("show");
}

function openEditExpenseModal(id) {
  const expense = expensesarr.find(function (e) {
    return e.id === id;
  });

  if (!expense) {
    return;
  }

  editingExpenseId = id;

  expenseModalTitle.textContent = "Edit Expense";
  expenseModalSubtitle.textContent = "Update this expense.";
  expenseSubmitText.textContent = "Save Changes";

  expenseNameInput.value = expense.name;
  expenseAmountInput.value = expense.amount;
  expenseCategoryInput.value = expense.category;
  expenseDateInput.value = expense.date;
  expenseNotesInput.value = expense.notes || "";

  expenseModal.classList.add("show");
}

function closeExpenseModalFunc() {
  expenseModal.classList.remove("show");
  editingExpenseId = null;
}

// =========================================
// RENDER EXPENSES
// =========================================

function renderExpenses(expensesToRender) {
  expenseList.innerHTML = "";

  if (expensesToRender.length === 0) {
    expenseList.innerHTML = `
      <div class="expenses-empty">
        <div class="expenses-empty-icon">
          <i class="fa-solid fa-receipt"></i>
        </div>
        <h3>No expenses found</h3>
        <p>Add an expense to start tracking your spending.</p>
      </div>
    `;
    return;
  }

  const sorted = [...expensesToRender].sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  sorted.forEach(function (expense) {
    const expenseItem = document.createElement("div");

    expenseItem.classList.add("expenses-list");

    const icon = categoryIcons[expense.category] || "fa-ellipsis";
    const color = categoryColors[expense.category] || "#64748b";
    const label = categoryLabels[expense.category] || "Other";

    const notesText = expense.notes
      ? `<p class="expense-notes">${expense.notes}</p>`
      : "";

    expenseItem.innerHTML = `
      <div class="expense-info">
        <div class="expense-icon" style="background: ${color}1a; color: ${color};">
          <i class="fa-solid ${icon}"></i>
        </div>

        <div class="expense-details">
          <h3>${expense.name}</h3>
          <p class="expense-category">${label}</p>
          <p class="expense-date-text">${expense.date}</p>
          ${notesText}
        </div>

        <strong class="expense-amount">${formatMoney(expense.amount)}</strong>

        <div class="expense-actions-group">
          <button
            type="button"
            class="expense-action-btn edit-expense-btn"
            data-id="${expense.id}"
            aria-label="Edit expense"
          >
            <i class="fa-solid fa-pen"></i>
          </button>

          <button
            type="button"
            class="expense-action-btn delete-expense-btn"
            data-id="${expense.id}"
            aria-label="Delete expense"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;

    expenseList.appendChild(expenseItem);
  });
}

// =========================================
// UPDATE EXPENSE LIST (FILTER + SEARCH)
// =========================================

function updateExpenseList() {
  const selectedCategory = expenseFilter.value;
  const searchText = expenseSearch.value.toLowerCase().trim();

  const filteredExpenses = expensesarr.filter(function (expense) {
    const matchesCategory =
      selectedCategory === "all" || expense.category === selectedCategory;

    const matchesSearch =
      expense.name.toLowerCase().includes(searchText) ||
      (expense.notes || "").toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  renderExpenses(filteredExpenses);
}

// =========================================
// UPDATE SUMMARY STATS
// =========================================

function updateSummary() {
  const today = new Date();

  let dailyTotal = 0;
  let monthlyTotal = 0;
  let total = 0;
  let highest = 0;

  expensesarr.forEach(function (expense) {
    const amount = Number(expense.amount) || 0;
    const expenseDate = new Date(expense.date);

    total += amount;

    if (amount > highest) {
      highest = amount;
    }

    const sameDay =
      expenseDate.getDate() === today.getDate() &&
      expenseDate.getMonth() === today.getMonth() &&
      expenseDate.getFullYear() === today.getFullYear();

    const sameMonth =
      expenseDate.getMonth() === today.getMonth() &&
      expenseDate.getFullYear() === today.getFullYear();

    if (sameDay) {
      dailyTotal += amount;
    }

    if (sameMonth) {
      monthlyTotal += amount;
    }
  });

  dailySpending.textContent = formatMoney(dailyTotal);
  monthlySpending.textContent = formatMoney(monthlyTotal);
  totalExpenses.textContent = formatMoney(total);
  highestExpense.textContent = formatMoney(highest);
  transCount.textContent = expensesarr.length;
}

// =========================================
// UPDATE CATEGORY BREAKDOWN
// =========================================

function updateCategoryBreakdown() {
  const breakdown = {};

  expensesarr.forEach(function (expense) {
    const category = expense.category || "other";

    if (!breakdown[category]) {
      breakdown[category] = 0;
    }

    breakdown[category] += Number(expense.amount) || 0;
  });

  const entries = Object.entries(breakdown).sort(function (a, b) {
    return b[1] - a[1];
  });

  const total = expensesarr.reduce(function (sum, expense) {
    return sum + (Number(expense.amount) || 0);
  }, 0);

  categoryBreakdownList.innerHTML = "";

  if (entries.length === 0) {
    categoryBreakdownList.innerHTML = `
      <p class="category-breakdown-empty">No spending data yet.</p>
    `;
    return;
  }

  entries.forEach(function (entry) {
    const category = entry[0];
    const amount = entry[1];

    const icon = categoryIcons[category] || "fa-ellipsis";
    const color = categoryColors[category] || "#64748b";
    const label = categoryLabels[category] || "Other";

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
        <div class="category-breakdown-bar-fill" style="width: ${percent}%; background: ${color};"></div>
      </div>
    `;

    categoryBreakdownList.appendChild(row);
  });
}

// =========================================
// SAVE EXPENSES
// =========================================

function saveExpenses() {
  localStorage.setItem("expensesarr", JSON.stringify(expensesarr));

  window.dispatchEvent(new Event("budgetUpdated"));
}

// =========================================
// EVENT LISTENERS
// =========================================

openExpenseModal.addEventListener("click", function () {
  openAddExpenseModal();
});

closeExpenseModal.addEventListener("click", closeExpenseModalFunc);

expenseModal.addEventListener("click", function (event) {
  if (event.target === expenseModal) {
    closeExpenseModalFunc();
  }
});

const expenseForm = document.getElementById("expenseForm");

expenseForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const expenseName = expenseNameInput.value.trim();
  const expenseAmount = Number(expenseAmountInput.value);
  const expenseCategory = expenseCategoryInput.value;
  const expenseDate = expenseDateInput.value;
  const expenseNotes = expenseNotesInput.value.trim();

  if (expenseName === "" || !expenseAmount || expenseAmount <= 0) {
    showToast("Please enter a valid name and amount.", "error");
    return;
  }

  if (expenseCategory === "") {
    showToast("Please select a category.", "error");
    return;
  }

  if (expenseDate === "") {
    showToast("Please select a date.", "error");
    return;
  }

  if (editingExpenseId !== null) {
    const index = expensesarr.findIndex(function (e) {
      return e.id === editingExpenseId;
    });

    if (index === -1) {
      return;
    }

    const oldAmount = Number(expensesarr[index].amount) || 0;
    const newAmount = expenseAmount;

    expensesarr[index].name = expenseName;
    expensesarr[index].amount = newAmount;
    expensesarr[index].category = expenseCategory;
    expensesarr[index].date = expenseDate;
    expensesarr[index].notes = expenseNotes;

    // Check daily limit after edit
    const dailyLimit = Number(localStorage.getItem("dailyLimit")) || 0;

    if (dailyLimit > 0) {
      const today = getTodayDate();

      const todayTotal = expensesarr.reduce(function (sum, expense) {
        if (expense.date === today && expense.id !== editingExpenseId) {
          return sum + (Number(expense.amount) || 0);
        }

        return sum;
      }, 0);

      const newDailyTotal = todayTotal + newAmount;

      if (newDailyTotal > dailyLimit) {
        showToast(
          `Warning: Daily limit of ${formatMoney(dailyLimit)} exceeded.`,
          "error",
        );
      }
    }

    saveExpenses();
    updateExpenseList();
    updateSummary();
    updateCategoryBreakdown();

    closeExpenseModalFunc();

    showToast("Expense updated successfully.");
    return;
  }

  // Check daily limit before adding
  const dailyLimit = Number(localStorage.getItem("dailyLimit")) || 0;

  if (dailyLimit > 0 && expenseDate === getTodayDate()) {
    const todayTotal = expensesarr.reduce(function (sum, expense) {
      if (expense.date === getTodayDate()) {
        return sum + (Number(expense.amount) || 0);
      }

      return sum;
    }, 0);

    const newDailyTotal = todayTotal + expenseAmount;

    if (newDailyTotal > dailyLimit) {
      const remaining = Math.max(dailyLimit - todayTotal, 0);

      showToast(
        `Daily limit exceeded! Only ${formatMoney(remaining)} remaining today.`,
        "error",
      );

      return;
    }
  }

  const expense = {
    id: Date.now(),
    name: expenseName,
    amount: expenseAmount,
    category: expenseCategory,
    date: expenseDate,
    notes: expenseNotes,
  };

  expensesarr.push(expense);

  saveExpenses();
  updateExpenseList();
  updateSummary();
  updateCategoryBreakdown();

  expenseForm.reset();
  expenseModal.classList.remove("show");

  showToast("Expense added successfully.");
});

// =========================================
// EXPENSE LIST ACTIONS (EDIT / DELETE)
// =========================================

expenseList.addEventListener("click", function (event) {
  const button = event.target.closest(".expense-action-btn");

  if (!button) {
    return;
  }

  const id = Number(button.dataset.id);

  if (button.classList.contains("edit-expense-btn")) {
    openEditExpenseModal(id);
    return;
  }

  if (button.classList.contains("delete-expense-btn")) {
    const expense = expensesarr.find(function (e) {
      return e.id === id;
    });

    if (!expense) {
      return;
    }

    const confirmed = confirm(
      `Delete expense "${expense.name}"?\n\nAmount: ${formatMoney(expense.amount)}\nDate: ${expense.date}`,
    );

    if (!confirmed) {
      return;
    }

    expensesarr = expensesarr.filter(function (e) {
      return e.id !== id;
    });

    saveExpenses();
    updateExpenseList();
    updateSummary();
    updateCategoryBreakdown();

    showToast("Expense deleted.");
  }
});

// =========================================
// FILTER & SEARCH
// =========================================

expenseFilter.addEventListener("change", updateExpenseList);

expenseSearch.addEventListener("input", updateExpenseList);

// =========================================
// CROSS-TAB / EVENT SYNC
// =========================================

window.addEventListener("budgetUpdated", function () {
  expensesarr = JSON.parse(localStorage.getItem("expensesarr")) || [];

  updateExpenseList();
  updateSummary();
  updateCategoryBreakdown();
});

window.addEventListener("storage", function () {
  expensesarr = JSON.parse(localStorage.getItem("expensesarr")) || [];

  updateExpenseList();
  updateSummary();
  updateCategoryBreakdown();
});

// =========================================
// INIT
// =========================================

updateExpenseList();
updateSummary();
updateCategoryBreakdown();
