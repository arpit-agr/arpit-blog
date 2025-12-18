---
pubDate: "2025-12-18T21:07+0530"
tags:
  - "scrollbars"
  - "layout"
  - "viewport"
  - "media-queries"
  - "css"
  - "mac-os"
---

Today I learned that on macOS, with the default scrollbar setting enabled, classic scrollbars are shown automatically when a mouse is connected. I used to believe that, mouse or not, users needed to explicitly change the scrollbar appearance to get the classic scrollbars.

This is relevant for everyone who builds websites because when classic scrollbars are shown, the value of `100vw` includes the scrollbar width. This can cause an unexpected horizontal overflow if the layout relies on `100vw` for full-width elements. Additionally, they affect media queries, which assume scrollbars don’t exist when evaluating viewport width.

Having said that, these aren’t new issues. Classic scrollbars are shown by default on Windows, where the same behaviors apply.

Further reading:

- [The large, small, and dynamic viewport units | Blog | web.dev](https://web.dev/blog/viewport-units)
- [New CSS Viewport Units Do Not Solve The Classic Scrollbar Problem — Smashing Magazine](https://www.smashingmagazine.com/2023/12/new-css-viewport-units-not-solve-classic-scrollbar-problem/)
- [Get the scrollbar width using only CSS](https://css-tip.com/width-scrollbar/)
- [Full-Bleed Layout with Modern CSS – Frontend Masters Blog](https://frontendmasters.com/blog/full-bleed-layout-with-modern-css/)
