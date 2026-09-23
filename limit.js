const openLimit = document.getElementById("openLimit");
const closeLimit = document.getElementById("closeLimit");
const limitSidebar = document.getElementById("limitSidebar");
const limitOverlay = document.getElementById("limitOverlay");
const limitForm = document.getElementById("limitForm");
const dailyLimitInput = document.getElementById("dailyLimit");
const monthlyLimitInput = document.getElementById("monthlyLimit");
const receivedInput = document.getElementById("received");

function formatMoney(value) {
  return `₦${(Number(value) || 0).toLocaleString("en-NG")}`;
}

function showLimitToast(message, type = "success") {
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
  toast.innerHTML = `<i class="fa-solid ${type === "error" ? "fa-circle-xmark" : "fa-circle-check"}"></i><span></span>`;
  toast.querySelector("span").textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-hide");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function openLimitSidebar(event) {
  if (event) event.preventDefault();

  dailyLimitInput.value = localStorage.getItem("dailyLimit") || "";
  monthlyLimitInput.value = localStorage.getItem("monthlyLimit") || "";
  receivedInput.value = localStorage.getItem("received") || "";

  limitSidebar.classList.add("show");
  limitOverlay.classList.add("show");
  dailyLimitInput.focus();
}

function closeLimitSidebar() {
  limitSidebar.classList.remove("show");
  limitOverlay.classList.remove("show");
}

openLimit.addEventListener("click", openLimitSidebar);
closeLimit.addEventListener("click", closeLimitSidebar);
limitOverlay.addEventListener("click", closeLimitSidebar);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && limitSidebar.classList.contains("show")) {
    closeLimitSidebar();
  }
});

limitForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const dailyLimit = Number(dailyLimitInput.value);
  const monthlyLimit = Number(monthlyLimitInput.value);
  const received = Number(receivedInput.value);

  if (![dailyLimit, monthlyLimit, received].every(Number.isFinite)) {
    showLimitToast("Enter valid amounts for all budget fields.", "error");
    return;
  }

  if (dailyLimit < 0 || monthlyLimit < 0 || received < 0) {
    showLimitToast("Amounts cannot be negative.", "error");
    return;
  }

  if (monthlyLimit > 0 && dailyLimit > monthlyLimit) {
    showLimitToast("Daily limit cannot be greater than the monthly limit.", "error");
    return;
  }

  localStorage.setItem("dailyLimit", dailyLimit);
  localStorage.setItem("monthlyLimit", monthlyLimit);
  localStorage.setItem("received", received);

  window.dispatchEvent(new Event("budgetUpdated"));
  closeLimitSidebar();
  showLimitToast(`Budget settings saved. ${formatMoney(received)} available to budget.`);
});
