document.addEventListener("DOMContentLoaded", () => {
  class ModeToggle {
    constructor() {
      this.toggleButton = document.getElementById("mode-toggle");
      const mode = ModeToggle.getCurrentMode();
      console.log(mode);
      ModeToggle.applyTheme(mode);

      this.toggleButton?.addEventListener("click", () => {
        ModeToggle.applyTheme(ModeToggle.getNextMode());
      });

      window.addEventListener("resize", () => {
        requestAnimationFrame(ModeToggle.handleResize);
      });
    }

    static getCurrentMode = () =>
      document.body.dataset.bsTheme?.trim() || 
      localStorage.getItem("mode") || 
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    

    static getNextMode() {
      return ModeToggle.getCurrentMode() === "light" ? "dark" : "light";
    }

    static getDevice() {
      return innerWidth < 768 ? "mobile" : "desktop";
    }

    static applyTheme(mode = 'light') {
      console.log('mode', mode);
      document.body.dataset.bsTheme = mode;
      localStorage.setItem("mode", mode);

      const allLinks = document.querySelectorAll("link[id^='topcoat-']");
      allLinks.forEach(link => link.disabled = true);

      const activeLink = document.getElementById(`topcoat-${ModeToggle.getDevice()}-${mode}`);
      if (activeLink) activeLink.disabled = false;
      else console.warn(`Missing stylesheet: topcoat-${ModeToggle.getDevice()}-${mode}`);
    }
    
    static handleResize() {
      const mode = ModeToggle.getCurrentMode();
      ModeToggle.applyTheme(mode);
    }
  }
console.log(ModeToggle.getCurrentMode());
  new ModeToggle();

  // Tooltips
  document.querySelectorAll("[data-bs-toggle='tooltip']").forEach(el => {
    bootstrap.Tooltip.getInstance(el)?.dispose();
    new bootstrap.Tooltip(el);
  });

  // Popovers
  document.querySelectorAll("[data-bs-toggle='popover']").forEach(el => {
    new bootstrap.Popover(el);
  });

  // Form submit
  document.getElementById("main-form-submit")?.addEventListener("click", async e => {
    e.preventDefault();
    const name = document.getElementById("name-input")?.value;
    const email = document.getElementById("email-input")?.value;
    const message = document.getElementById("comments-input")?.value;
    const formData = { name, email, message };

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbz7Dn-_I0HuEPnDGLzAPXW7mFdtQSGbvIgmfarC6texmBsB1Q3Iya6wUhyjP67cPbv7/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      alert(`Confirmation email sent successfully!
        Make sure to check your spam folder.`);
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email.");
    }
  });
});
