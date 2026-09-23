// =========================================
// DOM ELEMENTS
// =========================================

const goalModal = document.getElementById("goalModal");
const goalForm = document.getElementById("goalForm");
const goalModalTitle = document.getElementById("goalModalTitle");
const goalModalSubtitle = document.getElementById("goalModalSubtitle");
const goalSubmitText = document.getElementById("goalSubmitText");

const addSaving = document.getElementById("addSaving");
const closeGoalModal = document.getElementById("closeGoalModal");

const goalName = document.getElementById("goalName");
const goalCategory = document.getElementById("goalCategory");
const goalTargetAmount = document.getElementById("goalTargetAmount");
const goalCurrentAmount = document.getElementById("goalCurrentAmount");
const goalTargetDate = document.getElementById("goalTargetDate");
const goalNotes = document.getElementById("goalNotes");

const addMoneyModal = document.getElementById("addMoneyModal");
const addMoneyForm = document.getElementById("addMoneyForm");
const closeAddMoneyModal = document.getElementById("closeAddMoneyModal");
const addMoneyAmount = document.getElementById("addMoneyAmount");
const addMoneyGoalName = document.getElementById("addMoneyGoalName");

const goalsGrid = document.getElementById("goalsGrid");
const goalsEmpty = document.getElementById("goalsEmpty");

const totalSavings = document.getElementById("totalSavings");
const goalAmount = document.getElementById("goalAmount");
const goalPercent = document.getElementById("goalPercent");
const savingsProgress = document.getElementById("savingsProgress");
const activeGoals = document.getElementById("activeGoals");
const completedGoals = document.getElementById("completedGoals");

// =========================================
// STATE
// =========================================

let goals = JSON.parse(localStorage.getItem("savingsGoals")) || [];
let editingGoalId = null;
let addingMoneyGoalId = null;

// =========================================
// CATEGORY ICONS & COLORS
// =========================================

const categoryIcons = {
  "Emergency Fund": "fa-shield-halved",
  "School Fees": "fa-graduation-cap",
  "New Laptop": "fa-laptop",
  Transportation: "fa-bus",
  "Personal Goal": "fa-bullseye",
  Other: "fa-ellipsis",
};

const categoryColors = {
  "Emergency Fund": "#dc4c64",
  "School Fees": "#5548d9",
  "New Laptop": "#2876c7",
  Transportation: "#f59e0b",
  "Personal Goal": "#8057d9",
  Other: "#667085",
};

// =========================================
// HELPERS
// =========================================

function formatMoney(value) {
  return `₦${Number(value).toLocaleString()}`;
}

function getGoalProgress(goal) {
  const target = Number(goal.target) || 0;
  const current = Number(goal.current) || 0;

  if (target <= 0) {
    return 0;
  }

  return Math.min((current / target) * 100, 100);
}

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function saveGoals() {
  localStorage.setItem("savingsGoals", JSON.stringify(goals));

  const total = goals.reduce(function (sum, goal) {
    return sum + (Number(goal.current) || 0);
  }, 0);

  localStorage.setItem("savedAmount", total);

  window.dispatchEvent(new Event("budgetUpdated"));
}

// =========================================
// MODAL HELPERS
// =========================================

function openGoalModal() {
  goalModal.classList.add("show");
}

function closeGoalModalFunc() {
  goalModal.classList.remove("show");
  goalForm.reset();
  editingGoalId = null;
}

function openAddMoneyModal(goalId) {
  const goal = goals.find(function (g) {
    return g.id === goalId;
  });

  if (!goal) {
    return;
  }

  addingMoneyGoalId = goalId;
  addMoneyGoalName.textContent = `Add to "${goal.name}"`;
  addMoneyAmount.value = "";
  addMoneyModal.classList.add("show");
}

function closeAddMoneyModalFunc() {
  addMoneyModal.classList.remove("show");
  addingMoneyGoalId = null;
}

// =========================================
// RENDER GOALS
// =========================================

function renderGoals() {
  goalsGrid.innerHTML = "";

  if (goals.length === 0) {
    goalsGrid.appendChild(goalsEmpty);
    goalsEmpty.style.display = "flex";
    return;
  }

  goalsEmpty.style.display = "none";

  goals.forEach(function (goal) {
    const card = document.createElement("article");
    card.className = "goal-card";

    const progress = getGoalProgress(goal);
    const current = Number(goal.current) || 0;
    const target = Number(goal.target) || 0;
    const remaining = Math.max(target - current, 0);
    const completed = target > 0 && current >= target;

    const icon = categoryIcons[goal.category] || "fa-ellipsis";
    const color = categoryColors[goal.category] || "#667085";

    const targetDateText = goal.targetDate
      ? `<p class="goal-card-date"><i class="fa-regular fa-calendar"></i> Target: ${goal.targetDate}</p>`
      : "";

    const notesText = goal.notes
      ? `<p class="goal-card-notes">${goal.notes}</p>`
      : "";

    const completedBadge = completed
      ? '<span class="goal-completed-badge"><i class="fa-solid fa-check"></i> Completed</span>'
      : "";

    card.innerHTML = `
      <div class="goal-card-header">
        <div class="goal-card-icon" style="background: ${color}1a; color: ${color};">
          <i class="fa-solid ${icon}"></i>
        </div>

        <div class="goal-card-title">
          <h3>${goal.name}</h3>
          <span class="goal-card-category">${goal.category}</span>
        </div>

        ${completedBadge}
      </div>

      <div class="goal-card-amounts">
        <div>
          <p class="goal-card-label">Saved</p>
          <strong class="goal-card-saved">${formatMoney(current)}</strong>
        </div>

        <div class="goal-card-target">
          <p class="goal-card-label">Target</p>
          <strong>${formatMoney(target)}</strong>
        </div>
      </div>

      <div class="goal-card-progress-bar">
        <div class="goal-card-progress" style="width: ${progress}%; background: ${color};"></div>
      </div>

      <div class="goal-card-progress-info">
        <span>${Math.round(progress)}% complete</span>
        <span>${formatMoney(remaining)} remaining</span>
      </div>

      ${targetDateText}
      ${notesText}

      <div class="goal-card-actions">
        <button type="button" class="goal-action-btn add-money-btn" data-action="add" data-id="${goal.id}">
          <i class="fa-solid fa-plus"></i>
          Add Money
        </button>

        <button type="button" class="goal-action-btn edit-goal-btn" data-action="edit" data-id="${goal.id}">
          <i class="fa-solid fa-pen"></i>
        </button>

        <button type="button" class="goal-action-btn delete-goal-btn" data-action="delete" data-id="${goal.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    goalsGrid.appendChild(card);
  });
}

// =========================================
// UPDATE OVERVIEW
// =========================================

function updateOverview() {
  let total = 0;
  let totalTarget = 0;
  let activeCount = 0;
  let completedCount = 0;

  goals.forEach(function (goal) {
    const current = Number(goal.current) || 0;
    const target = Number(goal.target) || 0;

    total += current;
    totalTarget += target;

    if (target > 0 && current >= target) {
      completedCount++;
    } else {
      activeCount++;
    }
  });

  const overallPercent = totalTarget > 0 ? (total / totalTarget) * 100 : 0;

  totalSavings.textContent = formatMoney(total);
  goalAmount.textContent = `${formatMoney(total)} / ${formatMoney(totalTarget)}`;
  goalPercent.textContent = `${Math.round(overallPercent)}% of total goals`;
  savingsProgress.style.width = `${Math.min(overallPercent, 100)}%`;
  activeGoals.textContent = activeCount;
  completedGoals.textContent = completedCount;
}

// =========================================
// EVENT LISTENERS
// =========================================

addSaving.addEventListener("click", function () {
  goalModalTitle.textContent = "Create Savings Goal";
  goalModalSubtitle.textContent = "Set a new savings target.";
  goalSubmitText.textContent = "Create Goal";
  editingGoalId = null;
  goalForm.reset();
  openGoalModal();
});

closeGoalModal.addEventListener("click", closeGoalModalFunc);

goalModal.addEventListener("click", function (event) {
  if (event.target === goalModal) {
    closeGoalModalFunc();
  }
});

goalForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = goalName.value.trim();
  const category = goalCategory.value;
  const target = Number(goalTargetAmount.value);
  const current = Number(goalCurrentAmount.value) || 0;
  const targetDate = goalTargetDate.value;
  const notes = goalNotes.value.trim();

  if (name === "" || category === "" || target <= 0) {
    alert("Please complete all required fields.");
    return;
  }

  if (editingGoalId !== null) {
    const index = goals.findIndex(function (g) {
      return g.id === editingGoalId;
    });

    if (index !== -1) {
      goals[index].name = name;
      goals[index].category = category;
      goals[index].target = target;
      goals[index].current = current;
      goals[index].targetDate = targetDate;
      goals[index].notes = notes;
    }
  } else {
    const goal = {
      id: Date.now(),
      name: name,
      category: category,
      target: target,
      current: current,
      targetDate: targetDate,
      notes: notes,
      createdAt: getTodayDate(),
    };

    goals.push(goal);
  }

  saveGoals();
  renderGoals();
  updateOverview();
  closeGoalModalFunc();
});

closeAddMoneyModal.addEventListener("click", closeAddMoneyModalFunc);

addMoneyModal.addEventListener("click", function (event) {
  if (event.target === addMoneyModal) {
    closeAddMoneyModalFunc();
  }
});

addMoneyForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const amount = Number(addMoneyAmount.value);

  if (amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  const index = goals.findIndex(function (g) {
    return g.id === addingMoneyGoalId;
  });

  if (index === -1) {
    return;
  }

  goals[index].current = (Number(goals[index].current) || 0) + amount;

  saveGoals();
  renderGoals();
  updateOverview();
  closeAddMoneyModalFunc();
});

goalsGrid.addEventListener("click", function (event) {
  const button = event.target.closest(".goal-action-btn");

  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const id = Number(button.dataset.id);

  if (action === "add") {
    openAddMoneyModal(id);
    return;
  }

  if (action === "edit") {
    const goal = goals.find(function (g) {
      return g.id === id;
    });

    if (!goal) {
      return;
    }

    editingGoalId = id;

    goalModalTitle.textContent = "Edit Savings Goal";
    goalModalSubtitle.textContent = "Update your savings target.";
    goalSubmitText.textContent = "Save Changes";

    goalName.value = goal.name;
    goalCategory.value = goal.category;
    goalTargetAmount.value = goal.target;
    goalCurrentAmount.value = goal.current;
    goalTargetDate.value = goal.targetDate || "";
    goalNotes.value = goal.notes || "";

    openGoalModal();
    return;
  }

  if (action === "delete") {
    const goal = goals.find(function (g) {
      return g.id === id;
    });

    if (!goal) {
      return;
    }

    const confirmed = confirm(
      `Delete savings goal "${goal.name}"?\n\nThis will remove the goal and its saved amount.`,
    );

    if (!confirmed) {
      return;
    }

    goals = goals.filter(function (g) {
      return g.id !== id;
    });

    saveGoals();
    renderGoals();
    updateOverview();
  }
});

// =========================================
// CROSS-TAB / EVENT SYNC
// =========================================

window.addEventListener("budgetUpdated", function () {
  goals = JSON.parse(localStorage.getItem("savingsGoals")) || [];

  renderGoals();
  updateOverview();
});

window.addEventListener("storage", function () {
  goals = JSON.parse(localStorage.getItem("savingsGoals")) || [];

  renderGoals();
  updateOverview();
});

// =========================================
// INIT
// =========================================

document.addEventListener("DOMContentLoaded", function () {
  renderGoals();
  updateOverview();
});
