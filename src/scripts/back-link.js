class BackLink extends HTMLElement {
	connectedCallback() {
		// Find the inner <a>
		const link = this.querySelector("a");
		if (!link) return; // fail gracefully if none

		link.addEventListener("click", (e) => {
			const ref = document.referrer;
			if (ref && new URL(ref).origin === location.origin) {
				e.preventDefault();
				history.back();
			} else {
				location.href = "/";
			}
		});
	}
}
customElements.define("back-link", BackLink);
