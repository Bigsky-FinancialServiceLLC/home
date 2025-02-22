document.addEventListener("DOMContentLoaded", function () {
  /*** 🌓 Theme Toggle: Updates `data-bs-theme` & Stylesheets ***/
  const modeToggle = document.getElementById("mode-toggle");
  const topcoatStylesheet = document.getElementById("topcoat-stylesheet"); // Ensure this exists in HTML
  const mainStylesheet = document.getElementById("main-stylesheet"); // Your main style.css
  const clipContainer = document.querySelector(".clip");
  let buttonEnabled = true;

  function handleStylesheetChange(mode, targetElement = document.body) {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const topcoatVersion = isMobile ? `mobile-${mode}` : `desktop-${mode}`;
    const version = new Date().getTime(); // Cache-busting

    // Apply styles to the specified element (either `document.body` or `.clip`)
    if (targetElement === document.body) {
      if (topcoatStylesheet) {
        topcoatStylesheet.href = `https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/css/topcoat-${topcoatVersion}.min.css?v=${version}`;
      }
      if (mainStylesheet) {
        mainStylesheet.href = `style-${mode}.css?v=${version}`;
      }
    } else {
      // Create temporary styles for `.clip`
      const tempStylesheet = document.createElement("link");
      tempStylesheet.rel = "stylesheet";
      tempStylesheet.href = `https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/css/topcoat-${topcoatVersion}.min.css?v=${version}`;
      tempStylesheet.id = "temp-topcoat";
      targetElement.appendChild(tempStylesheet);
    }
  }

  function setMode(mode, targetElement = document.body) {
    targetElement.setAttribute("data-bs-theme", mode);
    localStorage.setItem("mode", mode);
  }

  // Load saved mode preference, defaulting to dark if none
  let savedMode = localStorage.getItem("mode") || "dark";
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
  
      // 🚀 Calculate scrollbar width dynamically
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
      document.body.style.paddingRight = `${scrollbarWidth}px`;
  
      // 🚀 Store original navbar and body height to prevent shifts
      const navHeight = document.querySelector(".navbar")?.offsetHeight || 0;
      document.documentElement.style.setProperty("--nav-height", `${navHeight}px`);
  
      document.body.classList.add("animating");
  
      const currentMode = document.body.getAttribute("data-bs-theme");
      const newMode = currentMode === "dark" ? "light" : "dark";
  
      const rect = modeToggle.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
  
      // 🚀 Ensure `.clip` is visible and set up before animation
      clipContainer.style.display = "block";
      clipContainer.style.background = getComputedStyle(document.body).backgroundColor;
      clipContainer.style.overflowY = "hidden";
  
      // 🚀 Apply theme change before animation starts
      setMode(newMode);
      handleStylesheetChange(newMode);
  
      // 🚀 Ensure `.clip` appears properly
      void clipContainer.offsetHeight;
  
      setTimeout(() => {
          clipContainer.style.clipPath = `circle(0% at ${centerX}px ${centerY}px)`;
          clipContainer.style.transition = "none";
  
          void clipContainer.offsetHeight; // 🚀 Force browser to reflow
  
          requestAnimationFrame(() => {
              clipContainer.style.transition = "clip-path 1s ease-in-out";
              clipContainer.style.clipPath = `circle(150% at ${centerX}px ${centerY}px)`;
          });
      }, 50);
  
      setTimeout(() => {
          // 🚀 Hide `.clip` after animation ends
          clipContainer.style.transition = "none";
          clipContainer.style.clipPath = `circle(0% at ${centerX}px ${centerY}px)`;
  
          setTimeout(() => {
              clipContainer.style.display = "none";
              buttonEnabled = true;
              document.body.classList.remove("animating");
  
              // 🚀 Restore normal scrolling and width
              document.body.style.paddingRight = "";
          }, 50);
      }, 1000);
  });
  

  }

  // Ensure mode is loaded correctly on page load
  document.addEventListener("DOMContentLoaded", () => {
    let savedMode = localStorage.getItem("mode") || "dark";
    setMode(savedMode);
  });
});

window.onload = () => IcomaticUtils.run();