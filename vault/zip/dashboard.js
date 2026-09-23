const balanceElement = document.getElementById("balance");
const dailySpending = document.getElementById("dailySpending");
const monthlySpending = document.getElementById("monthlySpending");
const receivedAmt = document.getElementById("receivedAmt");

const dlimit = document.getElementById("dlimit");
const dlimit1 = document.getElementById("dlimit1");
const mlimit = document.getElementById("mlimit");

const dailyRemaining = document.getElementById("dailyRemaining");
const monthlyRemaining = document.getElementById("monthlyRemaining");
const limitProgressText = document.getElementById("limitProgressText");

const limitProgress = document.getElementById("limitProgress");
const todayProgress = document.getElementById("todayProgress");
const monthProgress = document.getElementById("monthProgress");

const savingsAmount = document.getElementById("savingsAmount");
const savingsProgress = document.getElementById("savingsProgress");
const savingsProgressText = document.getElementById("savingsProgressText");

function getExpenses() {
  const savedExpenses = localStorage.getItem("expensesarr");

  return savedExpenses ? JSON.parse(savedExpenses) : [];
}

function getSavingsGoals() {
  const savedGoals = localStorage.getItem("savingsGoals");

  return savedGoals ? JSON.parse(savedGoals) : [];
}

function formatMoney(amount) {
  return `₦${Number(amount).toLocaleString()}`;
}

function updateDashboard() {
  const expensesarr = getExpenses();

  const received = Number(localStorage.getItem("received")) || 0;

  const dailyLimit = Number(localStorage.getItem("dailyLimit")) || 0;

  const monthlyLimit = Number(localStorage.getItem("monthlyLimit")) || 0;

  const savingsGoals = getSavingsGoals();

  let savedAmount = 0;
  let totalSavingsTarget = 0;
  let activeGoals = 0;
  let completedGoals = 0;

  savingsGoals.forEach(function (goal) {
    const current = Number(goal.current) || 0;
    const target = Number(goal.target) || 0;

    savedAmount += current;
    totalSavingsTarget += target;

    if (target > 0 && current >= target) {
      completedGoals++;
    } else {
      activeGoals++;
    }
  });

  let totalExpenses = 0;
  let dailyTotal = 0;
  let monthlyTotal = 0;

  const today = new Date();

  expensesarr.forEach(function (expense) {
    const amount = Number(expense.amount) || 0;
    const expenseDate = new Date(expense.date);

    totalExpenses += amount;

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

  const balance = received - totalExpenses - savedAmount;

  const dailyLeft = dailyLimit - dailyTotal;
  const monthlyLeft = monthlyLimit - monthlyTotal;

  const dailyPercentage = dailyLimit > 0 ? (dailyTotal / dailyLimit) * 100 : 0;

  const monthlyPercentage =
    monthlyLimit > 0 ? (monthlyTotal / monthlyLimit) * 100 : 0;

  const savingsPercentage =
    totalSavingsTarget > 0 ? (savedAmount / totalSavingsTarget) * 100 : 0;

  balanceElement.textContent = formatMoney(balance);

  receivedAmt.textContent = formatMoney(received);

  dailySpending.textContent = formatMoney(dailyTotal);

  monthlySpending.textContent = formatMoney(monthlyTotal);

  dlimit.textContent = formatMoney(dailyLimit);

  dlimit1.textContent = `Of ${formatMoney(dailyLimit)} daily limit`;

  mlimit.textContent = `Of ${formatMoney(monthlyLimit)} monthly limit`;

  if (dailyLeft >= 0) {
    dailyRemaining.textContent = `${formatMoney(dailyLeft)} remaining`;
  } else {
    dailyRemaining.textContent = `${formatMoney(Math.abs(dailyLeft))} over limit`;
  }

  if (monthlyLeft >= 0) {
    monthlyRemaining.textContent = `${formatMoney(monthlyLeft)} remaining`;
  } else {
    monthlyRemaining.textContent = `${formatMoney(Math.abs(monthlyLeft))} over limit`;
  }

  limitProgressText.textContent = `${formatMoney(dailyTotal)} used today`;

  limitProgress.style.width = `${Math.min(dailyPercentage, 100)}%`;

  todayProgress.style.width = `${Math.min(dailyPercentage, 100)}%`;

  monthProgress.style.width = `${Math.min(monthlyPercentage, 100)}%`;

  savingsAmount.textContent = formatMoney(savedAmount);

  savingsProgress.style.width = `${Math.min(savingsPercentage, 100)}%`;

  if (savingsGoals.length > 0) {
    savingsProgressText.textContent = `${Math.min(Math.round(savingsPercentage), 100)}% across ${savingsGoals.length} goal${savingsGoals.length > 1 ? "s" : ""}`;
  } else {
    savingsProgressText.textContent = `${formatMoney(savedAmount)} saved`;
  }
}

window.addEventListener("budgetUpdated", updateDashboard);

window.addEventListener("storage", updateDashboard);

updateDashboard();
