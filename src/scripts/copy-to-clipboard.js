// https://gomakethings.com/how-to-build-a-copy-to-clipboard-html-web-component/
customElements.define(
  "copy-to-clipboard",
  class extends HTMLElement {
    constructor() {
      super();

      this.btn = this.querySelector("button");
      this.text = this.getAttribute("text");

      // Get the messages
      this.original = this.btn.innerHTML;
      this.statusMsg = this.getAttribute("status-msg") ?? "Copied to Clipboard";
      this.copiedBtnLabel = this.getAttribute("copied-btn-label") ?? "Copied!";

      // If there's no text to copy, bail
      if (!this.text) return;

      // Listen for clicks
      this.btn.addEventListener("click", this);

      // Add an alert
      this.notify = document.createElement("div");
      this.notify.setAttribute("role", "status");
      this.notify.className = "visually-hidden";
      this.append(this.notify);
    }

    /**
     * Handle events on the Web Component
     * @param  {Event} event The event object
     */
    handleEvent() {
      this.copyToClipboard();
    }

    async copyToClipboard() {
      try {
        // Copy the text
        await navigator.clipboard.writeText(this.text);

        // Update the button and status text
        this.btn.innerHTML = this.copiedBtnLabel;
        this.notify.textContent = this.statusMsg;

        // Reset after 5 seconds
        setTimeout(() => {
          this.btn.innerHTML = this.original;
          this.notify.textContent = "";
        }, 5000);
      } catch (error) {
        console.warn("Unable to copy.", error);
      }
    }
  },
);
