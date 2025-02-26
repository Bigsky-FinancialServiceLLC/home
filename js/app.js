document.addEventListener("DOMContentLoaded", function () {


  class ColorMode {
    static getCurrentMode() {
      return document.body.dataset.bsTheme;
    }
    setMode() {
      document.body.dataset.bsTheme = this.newMode;
      localStorage.setItem("mode", this.mode);
      this.currentMode = this.mode || ColorMode.getCurrentMode();
      this.modifyStylesheetHref(this.currentMode);
    }
    modifyStylesheetHref(mode) {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const topcoatVersion = isMobile ? `mobile-${mode}` : `desktop-${mode}`;
        this.topcoatStylesheet.href = `https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/css/topcoat-${topcoatVersion}.min.css`;
    }
    static reverse(mode) {
      return mode === "dark" ? "light" : "dark";
    }
    // Function to sync scrolling during animation
    syncScroll() {
      this.clipContainer.scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    }
    constructor() {
      this.modeToggle = document.getElementById("mode-toggle");
      this.topcoatStylesheet = document.getElementById("topcoat-stylesheet");
      this.clipContainer = document.querySelector(".clip");
      this.buttonEnabled = true;
      // Optional: Check system preference and set mode if no saved preference
      this.systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      this.defaultMode = localStorage.getItem("mode") || (systemPrefersDark ? "dark" : "light");
      this.setMode(this.defaultMode);
      window.addEventListener("resize", () => this.modifyStylesheetHref(this.currentMode));
      this.modeToggle.addEventListener("click", () => {
        if (!this.buttonEnabled) return;
        this.buttonEnabled = false;

        this.currentMode = ColorMode.getCurrentMode();
        this.newMode = ColorMode.reverse(this.currentMode);

        // 🚀 Get the button's position to center the animation
        this.rect = this.modeToggle.getBoundingClientRect();
        this.centerX = this.rect.left + this.rect.width / 2;
        this.centerY = this.rect.top + this.rect.height / 2;

        // Preserve the scroll position
        this.scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

        // 🚀 Clone the body into `.clip` and apply the NEW theme
        this.clipContainer.innerHTML = document.body.innerHTML;
        this.clipContainer.dataset.bsTheme = this.newMode; // Apply the new theme to the clone

        // Ensure `.clip` is visible before animation starts
        this.clipContainer.style.display = "block";
        this.clipContainer.scrollTop = this.scrollTop;

        // Start listening for scroll events
        window.addEventListener("scroll", this.syncScroll);

        // Reset the clip animation
        this.clipContainer.style.clipPath = `circle(0% at ${this.centerX}px ${this.centerY}px)`;
        this.clipContainer.style.transition = "none"; // Ensure it's instantly reset before animation

        // 🚀 Force reflow so the animation starts properly
        void this.clipContainer.offsetHeight;

        requestAnimationFrame(() => {
          this.clipContainer.style.transition = "clip-path 1s ease-in-out"; // Reapply transition
          this.clipContainer.style.clipPath = `circle(150% at ${this.centerX}px ${this.centerY}px)`;
        });

        setTimeout(() => {
          // 🚀 Once animation completes, apply the new theme to the real body
          this.setMode(this.newMode);

          // 🚀 Reverse the animation to make it look smooth
          requestAnimationFrame(() => {
            this.clipContainer.style.transition = "none"; // Disable transition momentarily
            this.clipContainer.style.clipPath = `circle(0% at ${this.centerX}px ${this.centerY}px)`;
          });

          setTimeout(() => {
            // Hide `.clip` completely after animation finishes
            this.clipContainer.innerHTML = "";
            this.clipContainer.style.display = "none";
            this.buttonEnabled = true;

            // 🚀 Stop listening for scroll events
            window.removeEventListener("scroll", this.syncScroll);
          }, 50); // Tiny delay to ensure smooth transition reset
        }, 1000); // Animation duration
      });
    }
  }

  /*** 🛠️ Bootstrap Tooltips Initialization ***/
  const tooltipTriggerList = document.querySelectorAll("[data-bs-toggle='tooltip']");
  tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

  /* Icomatic Initialization */
  IcomaticUtils.run();
  new ColorMode();

  particlesJS("particles-js", {
    particles: {
      number: { value: 8, density: { enable: true, value_area: 800 } },
      color: { value: "#6699cc" },
      shape: {
        type: "circle",
        stroke: { width: 1, color: "#000000" },
        polygon: { nb_sides: 1 },
        image: { src: "img/github.svg", width: 100, height: 100 }
      },
      opacity: {
        value: 1,
        random: false,
        anim: { enable: false, speed: 1, opacity_min: 1, sync: false }
      },
      size: {
        value: 0,
        random: false,
        anim: { enable: false, speed: 4, size_min: 0, sync: false }
      },
      line_linked: {
        enable: true,
        distance: 1500,
        color: "#6699cc",
        opacity: 1,
        width: 7
      },
      move: {
        enable: true,
        speed: 1,
        direction: "none",
        random: true,
        straight: true,
        out_mode: "out",
        bounce: true,
        attract: { enable: false, rotateX: 600, rotateY: 1200 }
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" },
        resize: true
      },
      modes: {
        grab: { distance: 400, line_linked: { opacity: 1 } },
        bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
        repulse: { distance: 200, duration: 0.4 },
        push: { particles_nb: 4 },
        remove: { particles_nb: 2 }
      }
    },
    retina_detect: true
  });
  var update;
  update = function () {
    requestAnimationFrame(update);
  };
  requestAnimationFrame(update);

});