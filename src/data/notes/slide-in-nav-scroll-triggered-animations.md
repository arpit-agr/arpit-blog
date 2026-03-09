---
pubDate: "2026-03-09T21:34+0530"
tags:
  - "animations"
  - "css"
---


I liked [Kevin Powell's video on the slide-in nav](https://www.youtube.com/watch?v=6LJuWf4ySCI). In the video, Kevin demonstrates how to create a sticky header that initially scrolls away (when the user scrolls the page), then slides back into view as a sticky top bar once the user has scrolled past a certain threshold. 

He achieves the slide-in effect using scroll state queries and a negative `inset-block-start` on the sticky positioned element.

He also recreates the effect using scroll driven animations. But it's not an ideal solution, since as he puts it speaking about the header, "if I stop at the wrong spot, it's like halfway there". That is definitely a usability issue.

I remembered Bramus sharing his post [on scroll *triggered* animations](https://developer.chrome.com/blog/scroll-triggered-animations). As Bramus mentions, scroll triggered animations "trigger when crossing a specific scroll offset". This is exactly what's required to avoid the problem Kevin mentioned above.

Here’s my [CodePen demo](https://codepen.io/editor/arpit-codes/pen/019cd1ee-29b1-717f-8a27-9a37ba5f2c26) achieving the slide-in effect using scroll triggered animations.

I tested it on Chrome Canary v147. No other browser seems to support it yet, not even Chrome v145 even though Bramus' article says it ships with v145. On browsers that don't support scroll triggered animations, there is no slide-in effect but the header remains sticky.
