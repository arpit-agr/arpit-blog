---
pubDate: '2026-05-25T08:47+0530'
tags:
  - 'css'
  - 'text-decoration'
---

Today I learned via [Paweł Grzybek's post on Mastodon](https://mastodon.social/@pawelgrzybek/116623309838307564), where [Temani Afif pointed out](https://front-end.social/@css/116623467529621115) that text decorations propagate to their descendants, they aren't inherited.

The difference between propagation and inheritance is that the descendants don't get their own `text-decoration` property. So, the line, color, style and thickness are all determined by the ancestor where `text-decoration` was declared.

A descendant can still declare its own `text-decoration`, but that creates an additional decoration on top, it doesn't modify or remove the ancestor's.
