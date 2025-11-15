const fieldset = document.querySelector("fieldset");
const inputs = fieldset.querySelectorAll("input");
const books = Array.from(document.querySelectorAll(".book-list li"));

function applyFilter(value) {
	books.forEach((item) => {
		const matches = value === "all" || item.dataset.tags.includes(value);
		item.toggleAttribute("hidden", !matches);
	});
}

fieldset.removeAttribute("disabled");

inputs.forEach((input) => {
	input.addEventListener("change", (e) => {
		const value = e.target.value;

		if (!document.startViewTransition) {
			applyFilter(value);
			return;
		}

		document.startViewTransition(() => applyFilter(value));
	});
});
