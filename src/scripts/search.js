/**
 * Utility: Debounce
 * https://github.com/antonmedv/textarea/blob/7ab14e5df775a4f5e2d53465c1842889c16f91e4/index.html#L121C3-L127C4
 */
const debounce = (fn, ms) => {
	let timer;
	return function (...args) {
		clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), ms);
	};
};

class Search {
	constructor() {
		this.searchResults = null;
		this.searchResultsList = null;
		this.searchResultsCount = null;
		this.pagefind = null;

		this.debouncedSearch = debounce(this.performSearch, 300);
	}

	clearResults() {
		this.searchResultsCount.innerHTML = 'Results';
		this.searchResultsList.innerHTML = '';
	}

	escapeHTML(str) {
		if (!str) return '';
		return str.replace(
			/[&<>"']/g,
			(m) =>
				({
					'&': '&amp;',
					'<': '&lt;',
					'>': '&gt;',
					'"': '&quot;',
					"'": '&#39;',
				})[m],
		);
	}

	createResultHTML(result) {
		// console.log(result);
		const isNote = result.filters.collection[0] === 'notes';
		const pubDate = new Date(result.meta.date);
		const dateLocaleString = new Intl.DateTimeFormat('en-IN', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			timeZone: 'Asia/Kolkata',
		}).format(pubDate);

		const title = result.meta.title
			? this.escapeHTML(result.meta.title)
			: this.escapeHTML(result.url);
		const safeExcerpt = result.excerpt
			.replace(/</g, '&lt;')
			.replace(/&lt;mark>/g, '<mark>')
			.replace(/&lt;\/mark>/g, '</mark>');

		return `
			<li
				class="entry-item pb-space-m"
				data-collection=${result.filters.collection[0]}
			>
        <article class="stack">
					<h3 class="heading-2">
	       		${
							!isNote
								? `
							<a href="${this.escapeHTML(result.url)}">${title}</a>
							`
								: `
							<a href="${this.escapeHTML(result.url)}">
							  Noted on
							  <time datetime="${this.escapeHTML(result.meta.date)}">
							    ${dateLocaleString}
							  </time>
							</a>
	         `
						}
					</h3>
          <p class="search-result-excerpt">
            ${result.locations[0] > 35 ? `…` : ''}
            ${safeExcerpt}
            ${result.word_count > result.excerpt.split(' ').length ? `…` : ''}
          </p>
          <footer class="cluster text-step--1">
          	<a
							class="text-box-trim"
							href="${this.escapeHTML(result.url)}"
							rel="bookmark"
						>
		          <span class="pub-date text-box-trim">
		        		<span class="visually-hidden">Posted on</span>
								<time datetime="${this.escapeHTML(result.meta.date)}">
									${dateLocaleString}
								</time>
		          </span>
						</a>
          </footer>
        </article>
      </li>
    `;
	}

	/**
	 * Updates the UI text.
	 * Added a 'isLoading' parameter to handle the "Searching..." state.
	 */
	updateUI(count, query, isLoading = false) {
		let statusText = 'Results';
		let titleText = 'Search';

		if (isLoading) {
			statusText = `Searching for '${query}'...`;
		} else if (query && query.length > 1) {
			if (count > 0) {
				const plural = count !== 1 ? 's' : '';
				statusText = `${count} result${plural} for '${query}'`;
			} else {
				statusText = `No matches found for '${query}'`;
			}
			titleText = `${statusText} - Search`;
		}

		this.searchResultsCount.innerHTML = statusText;
		document.title = `${titleText} | Arpit's Blog`;
	}

	async getLibrary() {
		if (!this.pagefind) {
			try {
				this.pagefind = await import('/pagefind/pagefind.js');
				await this.pagefind.options({ excerptLength: 35 });
			} catch (error) {
				console.error('Error loading Pagefind:', error);
			}
		}
		return this.pagefind;
	}

	async performSearch(value) {
		if (value.length > 1) {
			// 1. Show the "Searching..." state immediately
			this.updateUI(0, value, true);
			this.searchResults.classList.remove('hidden');

			const pagefind = await this.getLibrary();
			if (!pagefind) return;

			const search = await pagefind.search(value);

			// If user cleared the input while we were waiting for Pagefind, abort
			if (!this.searchResultsCount.innerHTML.includes('Searching')) return;

			const results = await Promise.all(search.results.map((r) => r.data()));

			this.searchResultsList.innerHTML = results
				.map((result) => this.createResultHTML(result))
				.join('');

			// 2. Update with the actual results
			this.updateUI(results.length, value, false);
			this.searchResultsList.classList.toggle(
				'search-results-notfound',
				results.length === 0,
			);
		} else {
			this.clearResults();
			this.searchResults.classList.add('hidden');
			this.updateUI(0, '');
		}
	}

	hydrate() {
		const form = document.getElementById('search-form');
		const text = document.getElementById('search-term');
		const clearButton = document.querySelector('.clear-btn');

		this.searchResults = document.getElementById('search-results');
		this.searchResultsList = document.getElementById('search-results-list');
		this.searchResultsCount = document.getElementById('search-results-count');

		if (form) form.addEventListener('submit', (e) => e.preventDefault());

		if (text) {
			text.addEventListener('input', (event) => {
				const value = event.target.value;
				this.debouncedSearch(value);

				const url = new URL(window.location);
				if (value) url.searchParams.set('q', value);
				else url.searchParams.delete('q');
				window.history.replaceState({}, '', url);
			});

			const params = new URLSearchParams(window.location.search);
			const initialQuery = params.get('q');
			if (initialQuery) {
				text.value = initialQuery;
				this.performSearch(initialQuery);
			}
		}

		if (clearButton) {
			clearButton.addEventListener('click', () => {
				if (text) {
					text.value = '';
					text.dispatchEvent(new Event('input', { bubbles: true }));
					text.focus();
				}
			});
		}
	}
}

const search = new Search();
search.hydrate();
