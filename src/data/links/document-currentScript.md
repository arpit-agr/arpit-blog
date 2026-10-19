---
title: 'Inline rendering with document.currentScript'
pubDate: '2026-10-19T11:15:48+05:30'
link: 'https://leanrada.com/notes/inline-rendering-currentscript/'
tags:
  - 'javascript'
via:
  url: 'https://simonwillison.net/2026/Oct/17/document-currentscript/'
  label: 'Simon Willison'
---

Today I learned about `document.currentScript` thanks to Lean Rada.

Using `document.currentScript` with the `replaceWith()` method, the footer can update itself and fix one of the most common problems on the web: a stale copyright year.

```html
<footer>
	©
	<noscript>2026</noscript>
	<script>
		document.currentScript.replaceWith(new Date().getFullYear());
	</script>
</footer>
```

As mentioned on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/currentScript), `document.currentScript` <q>returns the `<script>` element whose script is currently being processed and isn't a JavaScript module</q>.

So when the above script runs, the `document.currentScript` returns the `script` element. However, a script can only change the page when it explicitly touches the DOM, so we use the `replaceWith()` method. It swaps the returned `script` element for the year.

Before I learned about `document.currentScript`, I would have used a templating language and set up a cron job to rebuild the site every 1st Jan. Or I would have used the `textContent` property, which needs an `id` or a selector to find the element. `document.currentScript` is much more convenient since it already knows where it is.
