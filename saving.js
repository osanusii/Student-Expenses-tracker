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

let goals = loadGoals();
let editingGoalId = null;
let addingMoneyGoalId = null;

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

function loadGoals() {
  try {
    const saved = JSON.parse(localStorage.getItem("savingsGoals") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function formatMoney(value) {
  const amount = Number(value) || 0;
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: amount % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

function getTodayDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function createGoalId() {
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
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "status");
  toast.innerHTML = `<i class="fa-solid ${type === "error" ? "fa-circle-xmark" : "fa-circle-check"}"></i><span>${escapeHTML(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-hide");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function getGoalProgress(goal) {
  const target = Number(goal.target) || 0;
  const current = Number(goal.current) || 0;
  return target > 0 ? Math.min((current / target) * 100, 100) : 0;
}

function saveGoals() {
  localStorage.setItem("savingsGoals", JSON.stringify(goals));
  const total = goals.reduce((sum, goal) => sum + (Number(goal.current) || 0), 0);
  localStorage.setItem("savedAmount", total);
  window.dispatchEvent(new Event("budgetUpdated"));
}

function openGoalModal() {
  goalModal.classList.add("show");
  setTimeout(() => goalName.focus(), 50);
}

function closeGoalModalFunc() {
  goalModal.classList.remove("show");
  goalForm.reset();
  editingGoalId = null;
}

function openAddMoneyModal(goalId) {
  const goal = goals.find((item) => String(item.id) === String(goalId));
  if (!goal) return;

  const remaining = Math.max((Number(goal.target) || 0) - (Number(goal.current) || 0), 0);
  if (remaining <= 0) {
    showToast("This savings goal is already complete.", "error");
    return;
  }

  addingMoneyGoalId = goal.id;
  addMoneyGoalName.textContent = `Add to "${goal.name}"`;
  addMoneyAmount.value = "";
  addMoneyAmount.max = remaining;
  addMoneyModal.classList.add("show");
  setTimeout(() => addMoneyAmount.focus(), 50);
}

function closeAddMoneyModalFunc() {
  addMoneyModal.classList.remove("show");
  addMoneyForm.reset();
  addingMoneyGoalId = null;
}

function renderGoals() {
  goalsGrid.innerHTML = "";

  if (goals.length === 0) {
    goalsGrid.appendChild(goalsEmpty);
    goalsEmpty.style.display = "flex";
    return;
  }

  goalsEmpty.style.display = "none";

  goals.forEach((goal) => {
    const card = document.createElement("article");
    card.className = "goal-card";

    const progress = getGoalProgress(goal);
    const current = Number(goal.current) || 0;
    const target = Number(goal.target) || 0;
    const remaining = Math.max(target - current, 0);
    const completed = target > 0 && current >= target;
    const icon = categoryIcons[goal.category] || "fa-ellipsis";
    const color = categoryColors[goal.category] || "#667085";

    card.innerHTML = `
      <div class="goal-card-header">
        <div class="goal-card-icon" style="background: ${color}1a; color: ${color};">
          <i class="fa-solid ${icon}"></i>
        </div>
        <div class="goal-card-title">
          <h3>${escapeHTML(goal.name)}</h3>
          <span class="goal-card-category">${escapeHTML(goal.category)}</span>
        </div>
        ${completed ? '<span class="goal-completed-badge"><i class="fa-solid fa-check"></i> Completed</span>' : ""}
      </div>

      <div class="goal-card-amounts">
        <div><p class="goal-card-label">Saved</p><strong class="goal-card-saved">${formatMoney(current)}</strong></div>
        <div class="goal-card-target"><p class="goal-card-label">Target</p><strong>${formatMoney(target)}</strong></div>
      </div>

      <div class="goal-card-progress-bar"><div class="goal-card-progress" style="width: ${progress}%; background: ${color};"></div></div>
      <div class="goal-card-progress-info"><span>${Math.round(progress)}% complete</span><span>${formatMoney(remaining)} remaining</span></div>
      ${goal.targetDate ? `<p class="goal-card-date"><i class="fa-regular fa-calendar"></i> Target: ${escapeHTML(goal.targetDate)}</p>` : ""}
      ${goal.notes ? `<p class="goal-card-notes">${escapeHTML(goal.notes)}</p>` : ""}

      <div class="goal-card-actions">
        <button type="button" class="goal-action-btn add-money-btn" data-action="add" data-id="${escapeHTML(goal.id)}" ${completed ? "disabled" : ""}>
          <i class="fa-solid fa-plus"></i> Add Money
        </button>
        <button type="button" class="goal-action-btn edit-goal-btn" data-action="edit" data-id="${escapeHTML(goal.id)}" aria-label="Edit ${escapeHTML(goal.name)}"><i class="fa-solid fa-pen"></i></button>
        <button type="button" class="goal-action-btn delete-goal-btn" data-action="delete" data-id="${escapeHTML(goal.id)}" aria-label="Delete ${escapeHTML(goal.name)}"><i class="fa-solid fa-trash"></i></button>
      </div>`;

    goalsGrid.appendChild(card);
  });
}

function updateOverview() {
  let total = 0;
  let totalTarget = 0;
  let activeCount = 0;
  let completedCount = 0;

  goals.forEach((goal) => {
    const current = Number(goal.current) || 0;
    const target = Number(goal.target) || 0;
    total += current;
    totalTarget += target;
    if (target > 0 && current >= target) completedCount++;
    else activeCount++;
  });

  const overallPercent = totalTarget > 0 ? (total / totalTarget) * 100 : 0;
  totalSavings.textContent = formatMoney(total);
  goalAmount.textContent = `${formatMoney(total)} / ${formatMoney(totalTarget)}`;
  goalPercent.textContent = `${Math.min(Math.round(overallPercent), 100)}% of total goals`;
  savingsProgress.style.width = `${Math.min(overallPercent, 100)}%`;
  activeGoals.textContent = activeCount;
  completedGoals.textContent = completedCount;
}

addSaving.addEventListener("click", () => {
  goalModalTitle.textContent = "Create Savings Goal";
  goalModalSubtitle.textContent = "Set a new savings target.";
  goalSubmitText.textContent = "Create Goal";
  editingGoalId = null;
  goalForm.reset();
  goalTargetDate.min = getTodayDate();
  openGoalModal();
});

closeGoalModal.addEventListener("click", closeGoalModalFunc);
goalModal.addEventListener("click", (event) => {
  if (event.target === goalModal) closeGoalModalFunc();
});

closeAddMoneyModal.addEventListener("click", closeAddMoneyModalFunc);
addMoneyModal.addEventListener("click", (event) => {
  if (event.target === addMoneyModal) closeAddMoneyModalFunc();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (goalModal.classList.contains("show")) closeGoalModalFunc();
  if (addMoneyModal.classList.contains("show")) closeAddMoneyModalFunc();
});

goalForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = goalName.value.trim();
  const category = goalCategory.value;
  const target = Number(goalTargetAmount.value);
  const current = Number(goalCurrentAmount.value) || 0;
  const targetDate = goalTargetDate.value;
  const notes = goalNotes.value.trim();

  if (!name) return showToast("Enter a savings goal name.", "error");
  if (name.length > 80) return showToast("Goal name must be 80 characters or fewer.", "error");
  if (!category || !categoryIcons[category]) return showToast("Select a valid savings category.", "error");
  if (!Number.isFinite(target) || target <= 0) return showToast("Enter a target amount greater than ₦0.", "error");
  if (!Number.isFinite(current) || current < 0) return showToast("Current savings cannot be negative.", "error");
  if (current > target) return showToast("Current savings cannot be greater than the target.", "error");
  if (targetDate && targetDate < getTodayDate()) return showToast("Target date cannot be in the past.", "error");
  if (notes.length > 250) return showToast("Notes must be 250 characters or fewer.", "error");

  if (editingGoalId !== null) {
    const index = goals.findIndex((goal) => String(goal.id) === String(editingGoalId));
    if (index === -1) return showToast("That savings goal no longer exists.", "error");
    goals[index] = { ...goals[index], name, category, target, current, targetDate, notes };
    showToast("Savings goal updated successfully.");
  } else {
    goals.push({ id: createGoalId(), name, category, target, current, targetDate, notes, createdAt: getTodayDate() });
    showToast("Savings goal created successfully.");
  }

  saveGoals();
  renderGoals();
  updateOverview();
  closeGoalModalFunc();
});

addMoneyForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const amount = Number(addMoneyAmount.value);
  if (!Number.isFinite(amount) || amount <= 0) return showToast("Enter an amount greater than ₦0.", "error");

  const index = goals.findIndex((goal) => String(goal.id) === String(addingMoneyGoalId));
  if (index === -1) return showToast("That savings goal no longer exists.", "error");

  const current = Number(goals[index].current) || 0;
  const target = Number(goals[index].target) || 0;
  const remaining = Math.max(target - current, 0);
  if (amount > remaining) return showToast(`You can add up to ${formatMoney(remaining)} to this goal.`, "error");

  goals[index].current = current + amount;
  saveGoals();
  renderGoals();
  updateOverview();
  closeAddMoneyModalFunc();
  showToast("Savings updated successfully.");
});

goalsGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".goal-action-btn");
  if (!button || button.disabled) return;

  const action = button.dataset.action;
  const id = button.dataset.id;
  const goal = goals.find((item) => String(item.id) === String(id));
  if (!goal) return showToast("That savings goal no longer exists.", "error");

  if (action === "add") return openAddMoneyModal(id);

  if (action === "edit") {
    editingGoalId = goal.id;
    goalModalTitle.textContent = "Edit Savings Goal";
    goalModalSubtitle.textContent = "Update your savings target.";
    goalSubmitText.textContent = "Save Changes";
    goalName.value = goal.name || "";
    goalCategory.value = goal.category || "";
    goalTargetAmount.value = goal.target || "";
    goalCurrentAmount.value = goal.current || "";
    goalTargetDate.value = goal.targetDate || "";
    goalTargetDate.min = getTodayDate();
    goalNotes.value = goal.notes || "";
    return openGoalModal();
  }

  if (action === "delete") {
    if (!window.confirm(`Delete savings goal "${goal.name}"?\n\nThis will remove the goal and its saved amount.`)) return;
    goals = goals.filter((item) => String(item.id) !== String(id));
    saveGoals();
    renderGoals();
    updateOverview();
    showToast("Savings goal deleted.");
  }
});

window.addEventListener("budgetUpdated", () => {
  goals = loadGoals();
  renderGoals();
  updateOverview();
});

window.addEventListener("storage", (event) => {
  if (!event.key || event.key === "savingsGoals") {
    goals = loadGoals();
    renderGoals();
    updateOverview();
  }
});

renderGoals();
updateOverview();
