const balanceElement = document.getElementById("balance");
const balanceDescription = document.getElementById("balanceDescription");
const receivedAmt = document.getElementById("receivedAmt");

const dailySpendingElement = document.getElementById("dailySpending");
const monthlySpendingElement = document.getElementById("monthlySpending");
const totalExpensesElement = document.getElementById("totalExpenses");
const expenseCountDescription = document.getElementById("expenseCountDescription");

const dlimitElement = document.getElementById("dlimit");
const dlimit1 = document.getElementById("dlimit1");
const monthlyLimitElement = document.getElementById("monthlyLimit");
const mlimit = document.getElementById("mlimit");

const dailyRemaining = document.getElementById("dailyRemaining");
const monthlyRemaining = document.getElementById("monthlyRemaining");
const limitProgressText = document.getElementById("limitProgressText");
const monthlyLimitStatus = document.getElementById("monthlyLimitStatus");
const monthlyLimitProgress = document.getElementById("monthlyLimitProgress");

const limitProgress = document.getElementById("limitProgress");
const todayProgress = document.getElementById("todayProgress");
const monthProgress = document.getElementById("monthProgress");

const savingsAmount = document.getElementById("savingsAmount");
const savingsProgress = document.getElementById("savingsProgress");
const savingsProgressText = document.getElementById("savingsProgressText");
const savingsGoalDescription = document.getElementById("savingsGoalDescription");

const activeGoals = document.getElementById("activeGoals");
const goalsStatus = document.getElementById("goalsStatus");
const savingsTargetStatus = document.getElementById("savingsTargetStatus");

function getStoredArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function getTodayDate() {
  const today = new Date();
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

function isThisMonth(dateString) {
  const [year, month] = String(dateString || "").split("-").map(Number);
  const today = new Date();

  return year === today.getFullYear() && month === today.getMonth() + 1;
}

function formatMoney(amount) {
  const value = Number(amount) || 0;
  return `₦${value.toLocaleString("en-NG", {
    minimumFractionDigits: value % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

function updateProgress(element, percentage) {
  if (!element) return;
  element.style.width = `${Math.min(Math.max(percentage, 0), 100)}%`;
}

function updateDashboard() {
  const expenses = getStoredArray("expensesarr");
  const savingsGoals = getStoredArray("savingsGoals");

  const received = Number(localStorage.getItem("received")) || 0;
  const dailyLimit = Number(localStorage.getItem("dailyLimit")) || 0;
  const monthlyLimit = Number(localStorage.getItem("monthlyLimit")) || 0;
  const today = getTodayDate();

  let totalExpenses = 0;
  let dailyTotal = 0;
  let monthlyTotal = 0;
  let savedAmount = 0;
  let totalSavingsTarget = 0;
  let completedGoals = 0;

  expenses.forEach((expense) => {
    const amount = Number(expense.amount) || 0;
    totalExpenses += amount;

    if (expense.date === today) dailyTotal += amount;
    if (isThisMonth(expense.date)) monthlyTotal += amount;
  });

  savingsGoals.forEach((goal) => {
    const current = Number(goal.current) || 0;
    const target = Number(goal.target) || 0;

    savedAmount += current;
    totalSavingsTarget += target;

    if (target > 0 && current >= target) completedGoals++;
  });

  const activeGoalCount = Math.max(savingsGoals.length - completedGoals, 0);
  const balance = received - totalExpenses - savedAmount;

  const dailyLeft = dailyLimit - dailyTotal;
  const monthlyLeft = monthlyLimit - monthlyTotal;

  const dailyPercentage = dailyLimit > 0 ? (dailyTotal / dailyLimit) * 100 : 0;
  const monthlyPercentage =
    monthlyLimit > 0 ? (monthlyTotal / monthlyLimit) * 100 : 0;
  const savingsPercentage =
    totalSavingsTarget > 0 ? (savedAmount / totalSavingsTarget) * 100 : 0;

  // Core financial metrics
  balanceElement.textContent = formatMoney(balance);
  receivedAmt.textContent = formatMoney(received);
  balanceDescription.textContent =
    balance >= 0
      ? `${formatMoney(balance)} available after expenses and savings`
      : `${formatMoney(Math.abs(balance))} more than available funds`;
  balanceElement.parentElement?.classList.toggle("balance-negative", balance < 0);

  totalExpensesElement.textContent = formatMoney(totalExpenses);
  expenseCountDescription.textContent =
    `${expenses.length.toLocaleString("en-NG")} transaction${expenses.length === 1 ? "" : "s"} recorded`;

  dailySpendingElement.textContent = formatMoney(dailyTotal);
  monthlySpendingElement.textContent = formatMoney(monthlyTotal);

  // Limits
  dlimitElement.textContent = formatMoney(dailyLimit);
  monthlyLimitElement.textContent = formatMoney(monthlyLimit);

  dlimit1.textContent =
    dailyLimit > 0 ? `Of ${formatMoney(dailyLimit)} daily limit` : "No daily limit set";

  mlimit.textContent =
    monthlyLimit > 0
      ? `Of ${formatMoney(monthlyLimit)} monthly limit`
      : "No monthly limit set";

  dailyRemaining.textContent =
    dailyLimit > 0
      ? dailyLeft >= 0
        ? `${formatMoney(dailyLeft)} remaining`
        : `${formatMoney(Math.abs(dailyLeft))} over limit`
      : "Set a daily limit to track remaining";

  monthlyRemaining.textContent =
    monthlyLimit > 0
      ? monthlyLeft >= 0
        ? `${formatMoney(monthlyLeft)} remaining`
        : `${formatMoney(Math.abs(monthlyLeft))} over limit`
      : "Set a monthly limit to track remaining";

  limitProgressText.textContent =
    dailyLimit > 0 ? `${formatMoney(dailyTotal)} used today` : "No daily limit set";

  monthlyLimitStatus.textContent =
    monthlyLimit > 0
      ? monthlyLeft >= 0
        ? `${Math.round(monthlyPercentage)}% used · ${formatMoney(monthlyLeft)} remaining`
        : `${Math.round(monthlyPercentage)}% used · ${formatMoney(Math.abs(monthlyLeft))} over limit`
      : "No monthly limit set";

  updateProgress(limitProgress, dailyPercentage);
  updateProgress(todayProgress, dailyPercentage);
  updateProgress(monthProgress, monthlyPercentage);
  updateProgress(monthlyLimitProgress, monthlyPercentage);

  // Savings metrics
  savingsAmount.textContent = formatMoney(savedAmount);
  savingsGoalDescription.textContent =
    `Across ${savingsGoals.length} savings goal${savingsGoals.length === 1 ? "" : "s"}`;

  savingsProgressText.textContent =
    totalSavingsTarget > 0
      ? `${Math.min(Math.round(savingsPercentage), 100)}% of ${formatMoney(totalSavingsTarget)} target`
      : "No savings goals yet";

  activeGoals.textContent = activeGoalCount;
  goalsStatus.textContent =
    `${activeGoalCount} active · ${completedGoals} completed`;

  savingsTargetStatus.textContent = `Target: ${formatMoney(totalSavingsTarget)}`;

  updateProgress(savingsProgress, savingsPercentage);

  // Make limit state visible without changing the existing design system.
  const dailyCard = dailyRemaining.closest(".card");
  const monthlyCard = monthlyRemaining.closest(".card");

  if (dailyCard) dailyCard.classList.toggle("limit-exceeded", dailyLimit > 0 && dailyLeft < 0);
  if (monthlyCard) monthlyCard.classList.toggle("limit-exceeded", monthlyLimit > 0 && monthlyLeft < 0);
}

window.addEventListener("budgetUpdated", updateDashboard);
window.addEventListener("storage", updateDashboard);
window.addEventListener("focus", updateDashboard);

updateDashboard();
