const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

function applyTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");

    if (themeIcon) {
      themeIcon.classList.remove("fa-moon");
      themeIcon.classList.add("fa-sun");
    }
  } else {
    document.body.classList.remove("dark-mode");

    if (themeIcon) {
      themeIcon.classList.remove("fa-sun");
      themeIcon.classList.add("fa-moon");
    }
  }
}

if (themeToggle) {
  themeToggle.addEventListener("click", function () {
    const isDark = document.body.classList.toggle("dark-mode");

    localStorage.setItem("theme", isDark ? "dark" : "light");

    applyTheme();
  });
}

applyTheme();
