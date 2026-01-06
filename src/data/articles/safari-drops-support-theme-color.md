---
title: Safari drops support for the theme-color meta tag
pubDate: 2025-11-09T16:30+0530
tags:
  - "theme-color"
  - "html"
  - "safari"
---

The `<meta name="theme-color">` tag is no longer supported in Safari 26 on macOS and iOS.

If a fixed or sticky element touches the top or bottom edge of the window, then and only then, Safari extends that element’s background color into the corresponding top or bottom bar. Otherwise, on iOS, the bars remain translucent and have no solid color background.

As [Wenson Hseih explained on WebKit Bugzilla](https://bugs.webkit.org/show_bug.cgi?id=301756#c2):

> A solid background color extension ("top bar tint") is only needed in cases where there's a viewport-constrained (fixed or sticky) element near one of the edges of the viewport that borders an obscured content inset (such as the top toolbar on macOS, or compact tab bar on iOS), in order to avoid a gap above or below fixed elements in the page that would otherwise appear when scrolling. This color extension behaviour is more critical on iPhone, where there's a much "softer" blur effect underneath the browser UI (and so more of the page underneath is otherwise directly visible).
