---
pubDate: 2025-09-17T08:31+0530
updatedDate: 2025-09-22T10:07+0530
tags:
- "color"
- "css"
---

[Ana Tudor wrote on Mastodon](https://mastodon.social/@anatudor/115214693132139947):

> Stupid #CSS question because I'm losing my mind here: why isn't calc(.5*a) working? What am I missing? It doesn't seem to be working in any browser.

Ana is trying to use `calc(.5 * a)` as a part of the relative color syntax, presumably to create semi transparent outlines. But it is not working because `calc(.5 * a)` is an invalid property value. As [Valtteri Laitinen replied](https://fedi.valtlai.fi/@valtlai/115214702277627522), it should actually be `alpha` in there instead of `a`.

```css ins="calc(.5 * alpha)" del="calc(.5 * a)"
.class {
	outline-color: rgb(from currentcolor r g b / calc(.5 * a)); /* ❌ invalid */
	outline-color: rgb(from currentcolor r g b / calc(.5 * alpha)); /* ✅ valid */
}
```
