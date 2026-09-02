---
pubDate: '2026-09-02T10:44+0530'
tags:
  - 'html'
  - 'accessibility'
---

Today I learned that modal `<dialog>`s opened with `showModal()` can have their own `<h1>`.

I discovered this while reading [Modern Web Guidance's HTML guide](https://github.com/GoogleChrome/modern-web-guidance/blob/main/skills/modern-web-guidance/guides/html/html.md). I was skeptical at first because it's bad practice to have multiple `<h1>`s on a single web page.

But this exception for modal dialogs made sense when I learned what `showModal()` does. It makes the rest of the page `inert` and as mentioned on [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert), `inert` HTML elements and their flat tree descendants <q>are hidden from assistive technologies as they are excluded from the accessibility tree</q>. So while the modal dialog is open there is no other `<h1>` to compete with.

I'm not sure if there is consensus on this because I have seen many examples where an `<h2>` was used instead.
