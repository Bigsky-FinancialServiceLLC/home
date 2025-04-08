document.addEventListener("DOMContentLoaded", function () {
  class Mode {
    constructor(stylesheet, shadowContainer, shadowStylesheet) {
      ModeToggle.prepareShadowContainer(shadowContainer);
      stylesheet.href = ModeToggle.generateTopcoatHref(
        ModeToggle.currentDeviceString(),
        ModeToggle.getCurrentMode()
      );
      shadowStylesheet.href = ModeToggle.generateTopcoatHref(
        ModeToggle.currentDeviceString(),
        ModeToggle.reverseMode()
      );
      document.body.setAttribute("data-bs-theme", ModeToggle.getCurrentMode());
      shadowContainer.setAttribute("data-bs-theme", ModeToggle.reverseMode());
    }
  }
  class ModeToggle {
    constructor() {
      this.currentMode = ModeToggle.getCurrentMode();
      this.nextMode = ModeToggle.reverseMode();
      this.device = ModeToggle.currentDeviceString();

      this.toggleButton = document.getElementById("mode-toggle");
      this.stylesheet = document.getElementById("topcoat-stylesheet");

      this.shadowContainer = document
        .getElementById("shadow-template")
        .content.cloneNode(true).firstElementChild;
      console.log(this.shadowContainer);
      this.shadowStylesheet = this.shadowContainer.querySelector("link");

      document.body.appendChild(this.shadowContainer);
      this.shadowStylesheet = this.shadowContainer.querySelector("link");

      this.init();
    }

    static prepareShadowContainer(shadowContainer) {
      const clonedChildren = [...document.body.children]
        .filter(
          (el, i) =>
            (el.id === "site-header" ||
              el.id === "site-footer" ||
              el.tagName === "MAIN") &&
            el.tagName !== "SCRIPT" &&
            el.tagName !== "TEMPLATE"
        ) // Skip script and template elements
        .map((el) => {
          const clone = el.cloneNode(true);
          clone.querySelectorAll("[id]").forEach((child) => {
            child.setAttribute("id", "shadow-" + child.id);
          });
          return clone;
        });

      console.log(shadowContainer);
      shadowContainer.replaceChildren(...clonedChildren);
    }

    static getCurrentMode() {
      let res;
      try {
        const storedMode = localStorage.getItem("mode");
        res =
          storedMode !== null
            ? storedMode
            : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
      } catch (error) {
        console.error("Error: localStorage unavailable", error);
        res = "light";
      }
      console.log(res);
      return res;
    }

    init() {
      document.body.setAttribute("data-bs-theme", this.currentMode);
      this.shadowContainer.setAttribute("data-bs-theme", this.nextMode);
      ModeToggle.prepareShadowContainer(this.shadowContainer);

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
      ModeToggle.updateStylesheet(this.stylesheet);
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
      return `./css/vendor/topcoat/topcoat-${device}-${mode}.min.css`;
    }

    installClickListener(btn) {
      btn.addEventListener("click", () => this.animateModeSwitch());
    }

    installScrollListener(doc) {
      doc.addEventListener("scroll", () => {
        requestAnimationFrame(() => ModeToggle.syncScroll());
      });
    }

    installResizeListener(win) {
      win.addEventListener("resize", () => {
        requestAnimationFrame(() =>
          ModeToggle.updateStylesheet(this.stylesheet)
        );
      });
    }

    static sqr(num) {
      return num * num;
    }

    static updateStylesheet(stylesheet) {
      const href = stylesheet?.href ?? "";
      this.currentMode = /-(light|dark)\.min\.css$/.exec(href)?.[1];
      if (!this.currentMode) return;

      const flippedMode = currentMode === "light" ? "dark" : "light";
      const newHref = href.replace(
        /-(light|dark)\.min\.css$/,
        `-${flippedMode}.min.css`
      );
      stylesheet.href = newHref;
      localStorage.setItem("mode", flippedMode);
    }
    static flipBody(nextMode, device) {
      document.body.setAttribute("data-bs-theme", nextMode);
      ModeToggle.activateStylesheet(device, nextMode);
      localStorage.setItem("mode", nextMode);
    }
    animateModeSwitch() {
      this.currentMode = ModeToggle.getCurrentMode();
      this.nextMode = ModeToggle.reverseMode();
      this.device = ModeToggle.currentDeviceString();

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        ModeToggle.flipBody(this.nextMode, this.device);
        return;
      }

      // 1. Shadow container = current mode (the snapshot)
      this.shadowContainer.setAttribute("data-bs-theme", this.nextMode);
      ModeToggle.activateShadowStylesheet(
        this.shadowContainer,
        this.device,
        this.nextMode
      );

      ModeToggle.syncScroll(this.shadowContainer);
      ModeToggle.show(this.shadowContainer);

      // 2. Flip real DOM underneath
      ModeToggle.flipBody(this.nextMode, this.device);

      // 3. Animate clip reveal
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxRadius = Math.sqrt(vw * vw + vh * vh);
      let animationStart = null;
      const duration = 900;

      const animate = (timestamp) => {
        if (!animationStart) animationStart = timestamp;
        const progress = (timestamp - animationStart) / duration;
        const size = Math.min(maxRadius, progress * maxRadius);

        ModeToggle.syncScroll(this.shadowContainer);
        this.shadowContainer.style.clipPath = `circle(${size}px at bottom right)`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.shadowContainer.style.clipPath = `circle(${maxRadius}px at bottom right)`;
          ModeToggle.hide(this.shadowContainer);
        }
      };

      requestAnimationFrame(animate);
    }

    static activateStylesheet(device, mode, container = document) {
      const allSheets = container.querySelectorAll("link[id^='topcoat-']");
      allSheets.forEach((link) => (link.disabled = true));

      const targetId = `topcoat-${device}-${mode}`;
      const target = container.querySelector(`#${targetId}`);
      if (target) {
        target.disabled = false;
        if (container === document) {
          localStorage.setItem("mode", mode);
        }
      } else {
        console.warn(`Stylesheet not found: #${targetId}`);
      }
    }
    static activateShadowStylesheet(shadowContainer, device, mode) {
      const links = shadowContainer.querySelectorAll("link[id^='topcoat-']");
      links.forEach((link) => (link.disabled = true));

      const targetId = `topcoat-${device}-${mode}`;
      const match = shadowContainer.querySelector(`#${targetId}`);
      if (match) match.disabled = false;
      else console.warn(`Shadow stylesheet not found: #${targetId}`);
    }

    static currentDeviceString() {
      return ModeToggle.isMobile(window.innerWidth) ? "mobile" : "desktop";
    }

    static syncScroll(shadowContainer) {
      if (!shadowContainer) return;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (shadowContainer.scrollTop !== scrollY) {
          shadowContainer.scrollTo(0, scrollY);
        }
      });
    }
  }

  new ModeToggle();

  (function initializeTooltips() {
    const tooltips = document.querySelectorAll("[data-bs-toggle='tooltip']")
    console.log(tooltips);
    tooltips.forEach((el) => {
      const instance = bootstrap.Tooltip.getInstance(el);
      if (instance) instance.dispose();
      new bootstrap.Tooltip(el);
    });
  })();

  (function initializePopovers() {
    const popoverTriggerList = document.querySelectorAll(
      "[data-bs-toggle='popover']"
    );
    console.log(popoverTriggerList);
    [...popoverTriggerList].forEach(
      (popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl)
    );
  })();


  const submitButton = document.getElementById("main-form-submit");
  submitButton.addEventListener("click", async (e) => {
    console.log('Sending Request.');
    e.preventDefault();
  
    const name = document.getElementById("name-input").value;
    const email = document.getElementById("email-input").value;
    const message = document.getElementById("comments-input").value;
  
    const formData = { name, email, message };
  
    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbz7Dn-_I0HuEPnDGLzAPXW7mFdtQSGbvIgmfarC6texmBsB1Q3Iya6wUhyjP67cPbv7/exec", {
        method: "POST",
        mode: "no-cors", // Google Apps Script does not support CORS
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  console.log(response);
      alert("Email Sent Successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email.");
    }
  });
  
});
