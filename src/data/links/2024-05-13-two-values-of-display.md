---
title: "Digging Into The Display Property: The Two Values Of Display — Smashing Magazine"
link: https://www.smashingmagazine.com/2019/04/display-two-value/
pubDate: 2024-05-13
via:
  url: https://front-end.social/@stefan/112426743422409016
  label: Stefan Judis
tags:
  - "display"
  - "layout"
  - "css"
  - "rachel-andrew"
---

> In [Level 3 of the Display specification](https://www.w3.org/TR/css-display-3), the value of `display` is defined as two keywords. These keywords define the outer value of display, which will be `inline` or `block` and therefore define how the element behaves in the layout alongside other elements. They also define the inner value of the element — or how the direct children of that element behave.
>
> This means that when you say `display: grid`, what you are really saying is `display: block grid`. You are asking for a block level grid container. An element that will have all of the block attributes — you can give it height and width, margin and padding, and it will stretch to fill the container. The children of that container, however, have been given the inner value of `grid` so they become grid items. How those grid items behave is defined in the CSS Grid Specification: the `display` spec gives us a way to tell the browser that this is the layout method we want to use.

As simply put by Rachel:

> When you define layout on a box in CSS, you are defining what happens to this box in terms of how it behaves in relation to all of the other boxes in the layout. You are also defining how the children of that box behave.
