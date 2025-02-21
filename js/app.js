// Fade-in on scroll using IntersectionObserver
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

  function handleStylesheetChange() {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const currentMode = document.body.dataset.bsTheme; // "dark" or "light"
    const topcoatVersion = isMobile ? `mobile-${currentMode}` : `desktop-${currentMode}`;
    
    if (topcoatStylesheet) {
      topcoatStylesheet.href = `https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/css/topcoat-${topcoatVersion}.min.css`;
    }
  }

  window.addEventListener('resize', handleStylesheetChange);
  

  function setMode(mode) {
    document.body.dataset.bsTheme = mode;
    localStorage.setItem("mode", mode);

    handleStylesheetChange();
  }

  // Load saved mode preference, defaulting to dark if none
  const savedMode = localStorage.getItem("mode") || "dark";
  setMode(savedMode);

  // Handle mode toggle clicks
  if (modeToggle) {
    modeToggle.addEventListener("click", function () {
      const currentMode = document.body.dataset.bsTheme;
      const newMode = currentMode === "dark" ? "light" : "dark";
      setMode(newMode);
    });
  }

  // Optional: Check system preference and set mode if desired
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const defaultMode = localStorage.getItem("mode") || (systemPrefersDark ? "dark" : "light");
  setMode(defaultMode);
});
