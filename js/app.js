document.addEventListener("DOMContentLoaded", function () {
  /*** 🌓 Theme Toggle: Updates `data-bs-theme` & Stylesheets ***/
  const modeToggle = document.getElementById("mode-toggle");
  const topcoatStylesheet = document.getElementById("topcoat-stylesheet"); // Ensure this exists in HTML
  const clipContainer = document.querySelector(".clip");
  let buttonEnabled = true;



  window.addEventListener("resize", modifyStylesheetHref);



  // Load saved mode preference, defaulting to dark if none
  const savedMode = localStorage.getItem("mode") || "dark";
  setMode(savedMode);

  // Function to sync scrolling during animation
  function syncScroll() {
    clipContainer.scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  }

  // Handle mode toggle with animation
  if (modeToggle) {
    modeToggle.addEventListener("click", () => {
      if (!buttonEnabled) return;
      buttonEnabled = false;

      const currentMode = document.body.dataset.bsTheme;
      const newMode = currentMode === "dark" ? "light" : "dark";

      // 🚀 Get the button's position to center the animation
      const rect = modeToggle.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Preserve the scroll position
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

      // 🚀 Clone the body into `.clip` and apply the NEW theme
      clipContainer.innerHTML = document.body.innerHTML;
      clipContainer.dataset.bsTheme = newMode; // Apply the new theme to the clone

      // Ensure `.clip` is visible before animation starts
      clipContainer.style.display = "block";
      clipContainer.scrollTop = scrollTop;

      // Start listening for scroll events
      window.addEventListener("scroll", syncScroll);

      // Reset the clip animation
      clipContainer.style.clipPath = `circle(0% at ${centerX}px ${centerY}px)`;
      clipContainer.style.transition = "none"; // Ensure it's instantly reset before animation

      // 🚀 Force reflow so the animation starts properly
      void clipContainer.offsetHeight;

      requestAnimationFrame(() => {
        clipContainer.style.transition = "clip-path 1s ease-in-out"; // Reapply transition
        clipContainer.style.clipPath = `circle(150% at ${centerX}px ${centerY}px)`;
      });


      setTimeout(() => {
        // 🚀 Once animation completes, apply the new theme to the real body
        setMode(newMode);

        // 🚀 Reverse the animation to make it look smooth
        requestAnimationFrame(() => {
          clipContainer.style.transition = "none"; // Disable transition momentarily
          clipContainer.style.clipPath = `circle(0% at ${centerX}px ${centerY}px)`;
        });

        setTimeout(() => {
          // Hide `.clip` completely after animation finishes
          clipContainer.innerHTML = "";
          clipContainer.style.display = "none";
          buttonEnabled = true;

          // 🚀 Stop listening for scroll events
          window.removeEventListener("scroll", syncScroll);
        }, 50); // Tiny delay to ensure smooth transition reset
      }, 1000); // Animation duration
    });
  }
  class ColorMode {
    setMode() {
      document.body.dataset.bsTheme = this.newMode;
      localStorage.setItem("mode", mode);
      this.currentMode = mode || document.body.dataset.bsTheme;
      ColorMode.modifyStylesheetHref(currentMode);
    }
    static modifyStylesheetHref(mode) {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      
      const topcoatVersion = isMobile ? `mobile-${currentMode}` : `desktop-${currentMode}`;

      if (topcoatStylesheet) {
        topcoatStylesheet.href = `https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/css/topcoat-${topcoatVersion}.min.css`;
      }
    }
    constructor() {
      this.newMode = "";
      // Optional: Check system preference and set mode if no saved preference
      this.systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      this.defaultMode = localStorage.getItem("mode") || (systemPrefersDark ? "dark" : "light");
      ColorMode.setMode(defaultMode);
    }
  }
  /*** 🛠️ Bootstrap Tooltips Initialization ***/
  const tooltipTriggerList = document.querySelectorAll("[data-bs-toggle='tooltip']");
  tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

  /* Icomatic Initialization */
  IcomaticUtils.run();
  ColorMode.modifyStylesheetHref();
});