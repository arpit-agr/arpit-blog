---
pubDate: '2026-11-26T11:58:17+05:30'
tags:
  - 'html'
  - 'images'
  - 'web-performance'
  - 'til'
---

Today I learned, lazy loading only works when JavaScript is enabled.

As per the [HTML spec](https://html.spec.whatwg.org/multipage/urls-and-fetching.html#lazy-loading-attributes),

> This is an anti-tracking measure, because if a user agent supported lazy loading when scripting is disabled, it would still be possible for a site to track a user's approximate scroll position throughout a session, by strategically placing images in a page's markup such that a server can track how many images are requested and when.
