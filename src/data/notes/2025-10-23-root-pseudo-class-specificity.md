---
pubDate: 2025-10-23T18:43+0530
tags:
  - "pseudo-class"
  - "specificity"
  - "css"
---

Today I learned, `:root` (0-1-0) has a higher specificity than `html` (0-0-1).

In hindsight, it's obvious. `:root` is a CSS pseudo-class selector and, like most pseudo-class selectors, it has the same specificity as a class selector or an attribute selector.
