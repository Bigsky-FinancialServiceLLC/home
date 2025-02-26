document.addEventListener("DOMContentLoaded", function () {
  /*** 🌓 Theme Toggle: Updates `data-bs-theme` & Stylesheets ***/
  const modeToggle = document.getElementById("mode-toggle");
  const topcoatStylesheet = document.getElementById("topcoat-stylesheet");
  const clipContainer = document.querySelector(".clip");
  let buttonEnabled = true;
  let finalScrollTop = window.scrollY; // Keep track of latest scroll position

  function handleStylesheetChange() {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const currentMode = document.body.dataset.bsTheme;
      const topcoatVersion = isMobile ? `mobile-${currentMode}` : `desktop-${currentMode}`;

      if (topcoatStylesheet) {
          topcoatStylesheet.href = `https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/css/topcoat-${topcoatVersion}.min.css`;
      }
  }

  window.addEventListener("resize", handleStylesheetChange);

  function setMode(mode) {
      document.body.dataset.bsTheme = mode;
      localStorage.setItem("mode", mode);
      handleStylesheetChange();
  }

  // Load saved mode preference, defaulting to dark if none
  const savedMode = localStorage.getItem("mode") || "dark";
  setMode(savedMode);

  // Function to sync scrolling dynamically during animation
  function syncScroll() {
      clipContainer.scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  }

  function reverseSyncScroll() {
      document.documentElement.scrollTop = clipContainer.scrollTop;
      document.body.scrollTop = clipContainer.scrollTop;
  }

  // Track the latest scroll position while animation is running
  function trackFinalScroll() {
      finalScrollTop = window.scrollY;
  }

  // Handle mode toggle with animation
  if (modeToggle) {
      modeToggle.addEventListener("click", () => {
          if (!buttonEnabled) return;
          buttonEnabled = false;

          const currentMode = document.body.dataset.bsTheme;
          const newMode = currentMode === "dark" ? "light" : "dark";

          // 🚀 Get the button's current position in the viewport and adjust for scroll position
          const rect = modeToggle.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2 + window.scrollY; // Adjust for scroll

          // Start tracking scroll position during animation
          window.addEventListener("scroll", trackFinalScroll);

          // 🚀 Clone the body into `.clip` and apply the NEW theme
          clipContainer.innerHTML = document.body.innerHTML;
          clipContainer.dataset.bsTheme = newMode;

          // Ensure `.clip` is visible before animation starts
          clipContainer.style.display = "block";
          clipContainer.style.position = "absolute"; 
          clipContainer.style.top = "0"; 
          clipContainer.style.left = "0";
          clipContainer.style.width = "100%";
          clipContainer.style.height = "auto"; 
          clipContainer.style.overflowY = "auto"; 
          clipContainer.scrollTop = finalScrollTop; // Sync initial scroll position

          // Enable two-way scroll sync
          clipContainer.addEventListener("scroll", reverseSyncScroll);
          document.addEventListener("scroll", syncScroll);

          // Reset the clip animation
          clipContainer.style.clipPath = `circle(0% at ${centerX}px ${centerY}px)`;
          clipContainer.style.transition = "none"; 

          // 🚀 Force reflow to ensure animation starts correctly
          void clipContainer.offsetHeight;

          requestAnimationFrame(() => {
              clipContainer.style.transition = "clip-path 1s ease-in-out"; 
              clipContainer.style.clipPath = `circle(150% at ${centerX}px ${centerY}px)`;
          });

          // Toggle moon/sun icon immediately
          modeToggle.classList.toggle("fa-moon");
          modeToggle.classList.toggle("fa-sun");

          setTimeout(() => {
              // 🚀 Apply the new theme to the real body
              setMode(newMode);

              // 🚀 Reverse the animation smoothly
              requestAnimationFrame(() => {
                  clipContainer.style.transition = "none"; 
                  clipContainer.style.clipPath = `circle(0% at ${centerX}px ${centerY}px)`;
              });

              setTimeout(() => {
                  // Hide `.clip` completely after animation finishes
                  clipContainer.innerHTML = "";
                  clipContainer.style.display = "none";

                  // Restore the exact final scroll position
                  setTimeout(() => {
                      window.scrollTo({ top: finalScrollTop, behavior: "instant" });
                      window.removeEventListener("scroll", trackFinalScroll); // Stop tracking scroll
                  }, 10); 

                  // Remove event listeners to prevent interference
                  clipContainer.removeEventListener("scroll", reverseSyncScroll);
                  document.removeEventListener("scroll", syncScroll);

                  buttonEnabled = true;
              }, 50);
          }, 550); 
      });
  }

  // Optional: Check system preference and set mode if no saved preference
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const defaultMode = localStorage.getItem("mode") || (systemPrefersDark ? "dark" : "light");
  setMode(defaultMode);

  /*** 🎭 Fade-in on scroll using IntersectionObserver ***/
  const fadeSections = document.querySelectorAll(".section-fade");
  const observerOptions = { threshold: 0.2 };

  const revealOnScroll = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add("section-show");
              observer.unobserve(entry.target);
          }
      });
  }, observerOptions);

  fadeSections.forEach(section => revealOnScroll.observe(section));

  /*** 🛠️ Bootstrap Tooltips Initialization ***/
  const tooltipTriggerList = document.querySelectorAll("[data-bs-toggle='tooltip']");
  tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});
