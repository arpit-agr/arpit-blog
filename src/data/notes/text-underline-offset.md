---
pubDate: 2024-01-19T07:00+0530
tags:
  - "underline"
  - "kevin-powell"
  - "css"
---

Thanks to [Kevin Powell](https://youtube.com/watch?v=x3MTfp3HDLc&t=506), today I learned that the `text-underline-offset` property is named so because it _only_ applies to underlines and not other [`text-decoration-line`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-line) values like `overline` and `line-through`.

```html
<a href="https://example.com">Example</a>
```

```css
a {
	text-decoration-line: underline overline; /* We can set multiple line-decoration properties at once */
	text-underline-offset: 16px; /* Only impacts underline */
}
```
