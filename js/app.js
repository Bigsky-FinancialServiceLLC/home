document.addEventListener("DOMContentLoaded", function () {
  class ModeToggle {
    constructor() {
      this.elements = {
        body: document.body,
        toggleButton: document.getElementById("mode-toggle"),
        stylesheet: document.getElementById("topcoat-stylesheet"),
        shadowContainer: document.getElementById("shadow-template").content.cloneNode(true).firstElementChild
      };
      this.elements.body.appendChild(this.elements.shadowContainer);
      this.elements.shadowStylesheet = this.elements.shadowContainer.querySelector('link');

      this.currentMode = ModeToggle.getCurrentMode();
      this.elements.body.setAttribute("data-bs-theme", this.currentMode);
      this.elements.shadowContainer.setAttribute("data-bs-theme", ModeToggle.reverseMode(this.currentMode));

      this.prepareShadowContainer();

      Object.assign(this.elements.shadowContainer.style, {
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

      ModeToggle.hide(this.elements.shadowContainer);
      this.init();
    }

    prepareShadowContainer() {
      const clonedChildren = [...this.elements.body.children].map(el => {
        const clone = el.cloneNode(true);
        clone.querySelectorAll("[id]").forEach(child => {
          child.setAttribute("id", "shadow-" + child.id);
        });
        return clone;
      });

      this.elements.shadowContainer.replaceChildren(...clonedChildren);
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
      this.installClickListener(this.elements.toggleButton);
      this.installScrollListener(document);
      this.installResizeListener(window);
      this.updateStylesheets();
    }

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

    installClickListener(btn) {
      btn.addEventListener("click", () => this.animateModeSwitch());
    }

    installScrollListener(doc) {
      doc.addEventListener("scroll", () => {
        requestAnimationFrame(() => this.syncScroll());
      });
    }

    installResizeListener(win) {
      win.addEventListener("resize", () => {
        requestAnimationFrame(() => this.updateStylesheets());
      });
    }

    static sqr(num) {
      return num * num;
    }

    updateStylesheets() {
      this.elements.stylesheet.href = ModeToggle.generateTopcoatHref(ModeToggle.currentDeviceString(), ModeToggle.getCurrentMode());
    }

    animateModeSwitch() {
      this.currentMode = ModeToggle.reverseMode(ModeToggle.getCurrentMode());
    
      ModeToggle.show(this.elements.shadowContainer);
      this.elements.shadowContainer.setAttribute("data-bs-theme", this.currentMode);
      this.elements.shadowStylesheet.href = this.getNextModeStylesheet();
    
      // 🚀 Ensure shadow DOM is correctly scrolled BEFORE animation starts
      this.syncScroll(); 
    
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxRadius = Math.sqrt(ModeToggle.sqr(vw) + ModeToggle.sqr(vh));
    
      let animationStart = null;
      const duration = 600;
    
      const animate = (timestamp) => {
        if (!animationStart) animationStart = timestamp;
        const progress = (timestamp - animationStart) / duration;
    
        // 🚀 Continuously sync scroll position throughout animation
        this.syncScroll(); 
    
        if (progress < 1) {
          const size = Math.min(maxRadius, progress * maxRadius);
          this.elements.shadowContainer.style.clipPath = `circle(${size}px at bottom right)`;
          requestAnimationFrame(animate);
        } else {
          this.elements.shadowContainer.style.clipPath = `circle(${maxRadius}px at bottom right)`;
    
          setTimeout(() => {
            this.toggleMode();
            ModeToggle.hide(this.elements.shadowContainer);
          }, 50);
        }
      };
    
      requestAnimationFrame(animate);
    }
   

    static currentDeviceString() {
      return ModeToggle.isMobile(window.innerWidth) ? "mobile" : "desktop";
    }

    getNextModeStylesheet() {
      return `https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/css/topcoat-${ModeToggle.currentDeviceString()}-${this.currentMode}.min.css`;
    }

    toggleMode() {
      this.currentMode = ModeToggle.reverseMode(ModeToggle.getCurrentMode());
      localStorage.setItem("mode", this.currentMode);
      this.elements.body.setAttribute("data-bs-theme", this.currentMode);
      this.updateStylesheets();
    }

    syncScroll() {
      if (!this.elements.shadowContainer) return;
      
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (this.elements.shadowContainer.scrollTop !== scrollY) {
          this.elements.shadowContainer.scrollTo(0, scrollY);
        }
      });
    }
    
  }

  new ModeToggle();

  function initializeTooltips() {
    document.querySelectorAll("[data-bs-toggle='tooltip']").forEach(el => {
      const instance = bootstrap.Tooltip.getInstance(el);
      if (instance) instance.dispose();
      new bootstrap.Tooltip(el);
    });
  }

  initializeTooltips();
});
