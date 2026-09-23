const openLimit = document.getElementById("openLimit");
const closeLimit = document.getElementById("closeLimit");
const limitSidebar = document.getElementById("limitSidebar");
const limitOverlay = document.getElementById("limitOverlay");
const limitForm = document.getElementById("limitForm");

const dailyLimitInput = document.getElementById("dailyLimit");
const monthlyLimitInput = document.getElementById("monthlyLimit");
const receivedInput = document.getElementById("received");

openLimit.addEventListener("click", function (event) {
  event.preventDefault();

  limitSidebar.classList.add("show");
  limitOverlay.classList.add("show");
});

function closeLimitSidebar() {
  limitSidebar.classList.remove("show");
  limitOverlay.classList.remove("show");
}

closeLimit.addEventListener("click", closeLimitSidebar);

limitOverlay.addEventListener("click", closeLimitSidebar);

dailyLimitInput.value = localStorage.getItem("dailyLimit") || "";

monthlyLimitInput.value = localStorage.getItem("monthlyLimit") || "";

receivedInput.value = localStorage.getItem("received") || "";

limitForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const dailyLimit = dailyLimitInput.value.trim();
  const monthlyLimit = monthlyLimitInput.value.trim();
  const received = receivedInput.value.trim();

  if (dailyLimit === "" || monthlyLimit === "" || received === "") {
    return;
  }

  localStorage.setItem("dailyLimit", dailyLimit);
  localStorage.setItem("monthlyLimit", monthlyLimit);
  localStorage.setItem("received", received);

  window.dispatchEvent(new Event("budgetUpdated"));

  closeLimitSidebar();
});
