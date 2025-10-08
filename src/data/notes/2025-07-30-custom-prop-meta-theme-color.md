---
pubDate: 2025-08-13T10:33+0530
tags:
- "theme-color"
- "html"
- "css"
---

I was reading [Manuel Matuzovic's article on meta theme
color](https://css-tricks.com/meta-theme-color-and-trickery/#aa-custom-properties)
and came across this snippet:

```html 'content="var(--theme)"'
<style>:root {--theme: blue;}</style>
<meta name="theme-color" content="var(--theme)" />
```

I wish it was possible to access custom properties outside the `<style>` tag in the `<head>`. It would keep things <i>DRY</i>.
