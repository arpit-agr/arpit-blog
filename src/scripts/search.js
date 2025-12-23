class Search {
	clearResults() {
		this.searchResultsCount.innerHTML = 'Results';
		this.searchResultsList.innerHTML = '';
	}

	addResult(result) {
		let listItem = document.createElement('li');
		listItem.classList.add('pb-space-m');

		const pubDate = new Date(result.meta.date);
		const dateISOString = result.meta.date;
		const dateLocaleString = pubDate.toLocaleString('en-IN', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			timeZone: 'Asia/Kolkata',
		});

		listItem.innerHTML = `
			<article class="stack">
				<footer class="text-step--1">
					<p class="pub-date text-box-trim">
						Posted on
						<time datetime="${dateISOString}">
							${dateLocaleString}
						</time>
					</p>
				</footer>
				<h3 class="heading-2">
		      <a href="${result.url}">
		     		${result.meta.title ? `${result.meta.title}` : result.url}
		      </a>
	      </h3>
	      <p class="search-result-excerpt">
	      	${result.locations[0] > 25 ? `[…]` : ''}
		      ${result.excerpt
						.replace(/</g, '&lt;')
						.replace(/&lt;mark>/g, '<mark>')
						.replace(/&lt;\/mark>/g, '</mark>')}
					${result.word_count > result.excerpt.split(' ').length ? `[…]` : ''}
	      </p>
      </article>
    `;
		this.searchResultsList.append(listItem);
	}

	updateUI(count, query) {
		let statusText = '';
		let titleText = '';

		if (!query || query.length <= 1) {
			statusText = 'Results';
			titleText = 'Search';
		} else if (count > 0) {
			const plural = count !== 1 ? 's' : '';
			statusText = `${count} result${plural} for '${query}'`;
			titleText = statusText + ' - Search';
		} else {
			statusText = `No matches found`;
			titleText = statusText + ' - Search';
		}

		this.searchResultsCount.innerHTML = statusText;
		document.title = `${titleText} | Arpit's Blog`;
	}

	async getLibrary() {
		if (!this.pagefind) {
			try {
				this.pagefind = await import('/pagefind/pagefind.js');
				this.pagefind.options({
					excerptLength: 25,
				});
			} catch (error) {
				console.error("Error loading '/pagefind/pagefind.js':", error);
			}
		}
		return this.pagefind;
	}

	async onInput(value) {
		let pagefind = await this.getLibrary();
		window.clearTimeout(this.onInputTimeout);
		this.onInputTimeout = window.setTimeout(async () => {
			this.clearResults();

			if (value.length > 1) {
				this.searchResults.classList.remove('hidden');

				let search = await pagefind.search(value);
				let results = await Promise.all(search.results.map((r) => r.data()));

				for (let result of results) {
					this.addResult(result, value);
				}
				// Use the helper
				this.updateUI(results.length, value);
				this.searchResultsList.classList[results.length > 0 ? 'remove' : 'add'](
					'search-results-notfound',
				);
			} else {
				this.searchResults.classList.add('hidden');
				this.updateUI(0, ''); // Reset title when input is too short
			}
		}, 300);
	}

	getQueryString() {
		let url = new URL(document.location.href);
		let searchQueryParam = url.searchParams.get('q');
		return searchQueryParam ? decodeURIComponent(searchQueryParam) : '';
	}

	hydrate() {
		let form = document.getElementById('search-form');
		if (form) {
			form.addEventListener(
				'submit',
				function (event) {
					event.preventDefault();
				},
				false,
			);
		}

		let text = document.getElementById('search-term');
		if (text) {
			text.addEventListener(
				'input',
				async (event) => {
					let value = event.target.value;
					await this.onInput(value);
					window.history.replaceState(
						{},
						'',
						`/search/${value ? `?q=${encodeURIComponent(value)}` : ''}`,
					);
				},
				false,
			);

			let queryString = this.getQueryString();
			if (queryString) {
				text.value = queryString;
				this.onInput(queryString);
			} else {
				text.value = '';
			}
		}

		let results = document.getElementById('search-results');
		if (results) {
			this.searchResults = results;
		}

		let resultsList = document.getElementById('search-results-list');
		if (resultsList) {
			this.searchResultsList = resultsList;
		}

		let resultsCount = document.getElementById('search-results-count');
		if (resultsCount) {
			this.searchResultsCount = resultsCount;
		}

		let clearButton = document.querySelector('.clear-btn');
		if (clearButton) {
			clearButton.addEventListener('click', () => {
				// Get a reference to the input element
				let searchInput = document.getElementById('search-term');

				// Clear the input text
				searchInput.value = '';

				// Trigger the 'input' event on the input element
				const event = new Event('input', { bubbles: true });
				searchInput.dispatchEvent(event);

				// Optionally, set focus back to the input field
				searchInput.focus();
			});
		}
	}
}

let search = new Search();
search.hydrate();
