---
pubDate: "2026-04-04T15:54+0530"
tags:
  - "css"
  - "grid"
---

Last week, I built a [visual explainer of the CSS Cascade](https://cascade.arpit.codes/).

I used anchor positioning with chained anchors to stack the cascade steps. It worked, but Safari 26.4 and earlier had a bug with chained anchors, so I had to exclude Safari entirely via an `@supports` hack.

I wasn't entirely happy with that, so I refactored the layout to use a subgrid based approach with `grid-template-areas`. Since [subgrid became Baseline Widely Available](https://web-platform-dx.github.io/web-features-explorer/features/subgrid/) recently, the timing also worked out.

While I was at it, I also restructured the HTML such that each cascade step is now a list item inside an ordered list, which gives better semantics.
