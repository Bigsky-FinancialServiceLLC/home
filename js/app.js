const fadeSections = document.querySelectorAll('.section-fade');
const options = { threshold: 0.2 };
const revealOnScroll = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('section-show');
      observer.unobserve(entry.target);
    }
  });
}, options);

fadeSections.forEach(sec => revealOnScroll.observe(sec));
document.addEventListener("DOMContentLoaded", function () {
  /*** 🌓 Theme Toggle: Updates data-bs-theme & Stylesheets ***/
  const modeToggle = document.getElementById("mode-toggle");
  const topcoatStylesheet = document.getElementById("topcoat-stylesheet"); // Must be set in HTML
  const modes = ["dark", "light"];
  function setMode(mode) {
    document.body.dataset.bsTheme = mode;
    localStorage.setItem("mode", mode);

    // Initialize with dark state
    modeToggle.classList.add(mode);
    modeToggle.classList.remove(...modes.filter((mode) => mode !== mode));
    // Detect device type (mobile or desktop)
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const topcoatVersion = isMobile ? `mobile-${mode}` : `desktop-${mode}`;

    // Update Topcoat stylesheet
    if (topcoatStylesheet) {
      topcoatStylesheet.href = `https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/css/topcoat-${topcoatVersion}.min.css`;
    }
  }

  // Load saved mode preference
  const savedMode = localStorage.getItem("mode") || "dark";
  setMode(savedMode);

  // Handle mode toggle
  if (modeToggle) {
    modeToggle.addEventListener("click", function () {
      if (modeToggle.classList.contains("dark")) {
        modeToggle.classList.remove("dark");
        modeToggle.classList.add("light");
      } else {
        modeToggle.classList.remove("light");
        modeToggle.classList.add("dark");
      }
      const currentMode = document.body.dataset.bsTheme;
      const newMode = currentMode === "dark" ? "light" : "dark";
      setMode(newMode);
    });
  }

  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const defaultMode =
    localStorage.getItem("mode") || (systemPrefersDark ? "dark" : "light");
  setMode(defaultMode);
});
