---
pubDate: 2025-10-27T19:30+0530
title: How I used 11ty to power a world-class museum's digital infrastructure with Nic Chan | 11ty Meetup - YouTube
link: https://www.youtube.com/watch?v=RRqnRCXBpzY
tags:
  - "meta"
  - "html"
  - "javascript"
  - "nic-chan"
---

Nic Chan on how they overcame the hurdle of getting the signs to refresh on a page in a signage browser with no JavaScript. The solution was using a `<meta>` tag that tells the browser to refresh the page after the given number of seconds.

```html
<meta http-equiv="refresh" content="3600" />
```
