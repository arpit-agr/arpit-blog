---
pubDate: '2026-11-26T10:51:48+05:30'
tags:
  - 'html'
  - 'accessibility'
  - 'til'
---

Today I learned, elements with a positive `tabindex` value are focused first, from the lowest value up, before `tabindex=“0”` in sequential keyboard navigation.

I was completely unaware of this behaviour. I guess because I had only ever used `tabindex=“0”` (for scrollable overflow containers) and `tabindex=“-1”` (to remove an element from sequential keyboard navigation) until now.

Also, via [MDN's reference page on `tabindex` HTML global attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/tabindex):

> Some focusable HTML elements have a default tabindex value of 0 set under the hood by the user agent. These elements are an `<a>` or `<area>` with `href` attribute, `<button>`, `<frame>` , `<iframe>`, `<input>`, `<object>`, `<select>`, `<textarea>`, and SVG `<a>` element, or a `<summary>` element that provides summary for a `<details>` element.
