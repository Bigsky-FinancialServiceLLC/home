document.addEventListener("DOMContentLoaded", function () {
  class ModeToggle {
    constructor() {
      
     
      this.body = document.body;
      this.toggleButton = document.getElementById("mode-toggle");
      this.stylesheet = document.getElementById("topcoat-stylesheet");

      this.shadowContainer = document.getElementById("shadow-template").content.cloneNode(true).firstElementChild;
      this.shadowStylesheet = this.shadowContainer.querySelector('link');

      this.body.appendChild(this.shadowContainer);
      this.shadowStylesheet = this.shadowContainer.querySelector('link');

      this.currentMode = ModeToggle.getCurrentMode();
     
      this.init();
    }

    prepareShadowContainer() {
      const clonedChildren = [...this.body.children]
        .filter(el => el.tagName !== 'SCRIPT' && el.tagName !== 'TEMPLATE') // Skip script and template elements
        .map(el => {
          const clone = el.cloneNode(true);
          clone.querySelectorAll("[id]").forEach(child => {
            child.setAttribute("id", "shadow-" + child.id);
          });
          return clone;
        });
    
      console.log(clonedChildren);
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
      this.body.setAttribute("data-bs-theme", this.currentMode);
      this.shadowContainer.setAttribute("data-bs-theme", ModeToggle.reverseMode(this.currentMode));
      this.prepareShadowContainer();
   

      Object.assign(this.shadowContainer.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        overflow: "auto",
        zIndex: "9999",
        pointerEvents: "none",
        clipPath: "circle(0% at bottom right)",
      });

      ModeToggle.hide(this.shadowContainer);
      this.installClickListener(this.toggleButton);
      this.installScrollListener(document);
      this.installResizeListener(window);
      this.updateStylesheets();
    }

    static reverseMode() {
      return ModeToggle.getCurrentMode() === "light" ? "dark" : "light";
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
      return `./../css/vendor/topcoat/topcoat-${device}-${mode}.min.css`;
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
      this.stylesheet.href = ModeToggle.generateTopcoatHref(ModeToggle.currentDeviceString(), ModeToggle.getCurrentMode());
    }

    animateModeSwitch() {
      this.currentMode = ModeToggle.reverseMode();
    
      ModeToggle.show(this.shadowContainer);
      this.shadowContainer.setAttribute("data-bs-theme", ModeToggle.reverseMode());
      this.shadowStylesheet.href = ModeToggle.getNextModeStylesheet();
    
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
   

    static currentDeviceString() {
      return ModeToggle.isMobile(window.innerWidth) ? "mobile" : "desktop";
    }

    static getNextModeStylesheet() {
      return ModeToggle.generateTopcoatHref(ModeToggle.currentDeviceString(), ModeToggle.reverseMode());
    }

    toggleMode() {
      this.currentMode = ModeToggle.reverseMode(ModeToggle.getCurrentMode());
      localStorage.setItem("mode", this.currentMode);
      this.body.setAttribute("data-bs-theme", this.currentMode);
      this.updateStylesheets();
    }

    syncScroll() {
      if (!this.shadowContainer) return;
      
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (this.shadowContainer.scrollTop !== scrollY) {
          this.shadowContainer.scrollTo(0, scrollY);
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

 function initializePopovers() {
  const popoverTriggerList = document.querySelectorAll(
    "[data-bs-toggle='popover']"
  );
  const popoverList = [...popoverTriggerList].map(
    popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl)
  );  
 }

  initializeTooltips();
  initializePopovers();
});
