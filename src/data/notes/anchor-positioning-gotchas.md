---
pubDate: "2026-03-11T18:52+0530"
tags:
  - "anchor-positioning"
  - "css"
---

I just read the latest issue of [Chris' Corner on CodePen](https://blog.codepen.io/2026/03/09/chris-corner-anchors/). I then read the following articles, all of which Chris links to:

- Chris' article on [The Big Gotcha of Anchor Positioning](https://frontendmasters.com/blog/the-big-gotcha-of-anchor-positioning/)
- Temani Afif's article on [Why is Anchor Positioning not working?](https://css-tip.com/anchor-issues/)
- James Stuckey Weber's article on [CSS Anchor Positioning in Practice](https://www.oddbird.net/2025/01/29/anchor-position-validity/)

Oh boy! My mind is completely fried. I had no idea anchor positioning was this complicated. I would be afraid to touch CSS anchor positioning if not for this recommendation from James to make it work reliably.

> 1. Make the anchor and the positioned element siblings.
> 2. Put the anchor first in the DOM.

I also saw the Winging It episode on [‘Debugging CSS Anchor Positioning‘](https://www.youtube.com/watch?v=3vwruYb9du4). It really helped me develop a mental model of how anchor positioning works and why the gotchas exist.

Also, I think I'm starting to finally grasp what containing blocks are in CSS. And I totally agree with [Tab Atkins-Bittner](https://bsky.app/profile/tabatkins.com), dev tools really need a way to show the containing block for elements, especially absPos/fixedPos elements.
