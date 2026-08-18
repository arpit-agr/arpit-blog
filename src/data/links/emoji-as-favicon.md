---
title: 'How To Use an Emoji as a Favicon Easily | CSS-Tricks'
pubDate: '2026-08-18T10:11+0530'
link: 'https://css-tricks.com/emoji-as-a-favicon/'
tags:
  - 'favicon'
  - 'svg'
  - 'html'
---

Here's the one-liner Chris Coyier uses:

```html
<link
	rel="icon"
	href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎯</text></svg>"
/>
```
