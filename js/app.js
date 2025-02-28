document.addEventListener("DOMContentLoaded", function () {
  class ModeToggle {
    constructor() {
      this.body = document.body;
      this.toggleButton = document.getElementById("mode-toggle");
      this.stylesheet = document.getElementById("topcoat-stylesheet");

      // Clone shadow template and append it to the body
      this.shadowContainer = document.getElementById("shadow-template").content.cloneNode(true).firstElementChild;
      this.body.appendChild(this.shadowContainer);

      this.shadowStylesheet = this.shadowContainer.querySelector('link');

      this.currentMode = ModeToggle.getCurrentMode();
      this.body.setAttribute("data-bs-theme", this.currentMode);
      this.shadowContainer.setAttribute("data-bs-theme", ModeToggle.reverseMode(this.currentMode));

      this.prepareShadowContainer(); // 🛠️ Ensure no duplicate IDs in shadow body

      // ✅ Apply fixed styles ONCE for the shadow container
      Object.assign(this.shadowContainer.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        zIndex: "9999",
        pointerEvents: "none",
        clipPath: "circle(0% at bottom right)",
      });

      ModeToggle.hide(this.shadowContainer);
      this.init();
    }

    /** Ensure all elements in the shadow body have unique IDs */
    prepareShadowContainer() {
      const clonedChildren = [...this.body.children].map(el => {
        const clone = el.cloneNode(true);
        clone.querySelectorAll("[id]").forEach(child => {
          child.setAttribute("id", "shadow-" + child.id); // Prefix all IDs
        });
        return clone;
      });

      this.shadowContainer.replaceChildren(...clonedChildren);
    }

    static getCurrentMode() {
      try {
        const storedMode = localStorage.getItem("mode");
        return storedMode !== null ? storedMode : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      } catch (error) {
        console.error("Error: localStorage unavailable", error);
        return "light";
      }
    }
    

    init() {
      this.installClickListener();
      this.installScrollListener();
      this.installResizeListener();
      this.updateStylesheets();
    }

    /** Utility Methods */
    static reverseMode(mode) {
      return mode === "light" ? "dark" : "light";
    }

    static isMobile(width) {
      return width < 768;
    }

    static hide(e) {
      e.classList.add("d-none");
    }

    static show(e) {
      e.classList.remove("d-none");
    }

    static generateTopcoatHref(device, mode) {
      return `https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/css/topcoat-${device}-${mode}.min.css`;
    }

    installClickListener() {
      this.toggleButton.addEventListener("click", () => this.animateModeSwitch());
    }

    installScrollListener() {
      document.addEventListener("scroll", () => {
        requestAnimationFrame(() => this.syncScroll());
      });
    }

    installResizeListener() {
      window.addEventListener("resize", () => {
        requestAnimationFrame(() => this.updateStylesheets());
      });
    }

    updateStylesheets() {
      const isMobile = window.innerWidth < 768;
      this.stylesheet.href = ModeToggle.generateTopcoatHref(isMobile ? "mobile" : "desktop", ModeToggle.getCurrentMode);
    }

    animateModeSwitch() {
      ModeToggle.show(this.shadowContainer);
      this.shadowContainer.setAttribute("data-bs-theme", ModeToggle.reverseMode(ModeToggle.getCurrentMode));
      this.shadowStylesheet.href = this.getNextModeStylesheet();

      // ✅ Calculate the correct max radius for the viewport
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxRadius = Math.sqrt(vw * vw + vh * vh); // Use hypotenuse

      // ✅ Start animation with `requestAnimationFrame()`
      let animationStart = null;
      const duration = 500; // Animation duration in milliseconds

      const animate = (timestamp) => {
        if (!animationStart) animationStart = timestamp;
        const progress = (timestamp - animationStart) / duration;
        
        if (progress < 1) {
          const size = Math.min(maxRadius, progress * maxRadius);
          this.shadowContainer.style.clipPath = `circle(${size}px at bottom right)`;
          requestAnimationFrame(animate);
        } else {
          this.shadowContainer.style.clipPath = `circle(${maxRadius}px at bottom right)`;

          setTimeout(() => {
            this.toggleMode();
            ModeToggle.hide(this.shadowContainer);
          }, 50);
        }
      };

      requestAnimationFrame(animate);
    }

    currentDeviceString() {
      return ModeToggle.isMobile(window.innerWidth) ? "mobile" : "desktop";
    }

    getNextModeStylesheet() {
      return `https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/css/topcoat-${this.currentDeviceString()}-${ModeToggle.reverseMode(this.currentMode)}.min.css`;
    }

    toggleMode() {
      this.currentMode = ModeToggle.reverseMode(ModeToggle.getCurrentMode());
      localStorage.setItem("mode", this.currentMode);
      this.body.setAttribute("data-bs-theme", this.currentMode);
      this.updateStylesheets();
    }

    syncScroll() {
      this.shadowContainer.scrollTo(0, window.scrollY);
      if (Math.abs(this.shadowContainer.scrollTop - window.scrollY) > 1) {
        console.warn("Scroll events are desynchronized. Resyncing...");
        this.shadowContainer.scrollTo(0, window.scrollY);
      }
    }
  }

  new ModeToggle();

  /*** 🛠️ Bootstrap Tooltips Initialization ***/
  function initializeTooltips() {
    const tooltipTriggerList = document.querySelectorAll("[data-bs-toggle='tooltip']");
    tooltipTriggerList.forEach(tooltipTriggerEl => {
      const instance = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
      if (instance) instance.dispose(); // Destroy existing tooltips
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  initializeTooltips(); // Run once on page load


});