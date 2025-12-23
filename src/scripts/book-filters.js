const fieldset = document.querySelector('fieldset');
const inputs = fieldset.querySelectorAll('input');
const books = Array.from(document.querySelectorAll('.book-list li'));
let bookResultsCount = document.getElementById('books-results-count');

function applyFilter(value) {
	books.forEach((item) => {
		const matches = value === 'all' || item.dataset.tags.includes(value);
		item.toggleAttribute('hidden', !matches);
	});
}

function updateCounts() {
	const count = books.filter((book) => !book.hasAttribute('hidden')).length;
	bookResultsCount.textContent = `${count} ${count === 1 ? 'book' : 'books'}`;
}

fieldset.removeAttribute('disabled');

inputs.forEach((input) => {
	input.addEventListener('change', (e) => {
		const value = e.target.value;

		if (!document.startViewTransition) {
			applyFilter(value);
			updateCounts();
			return;
		}

		document.startViewTransition(() => {
			applyFilter(value);
			updateCounts();
		});
	});
});
