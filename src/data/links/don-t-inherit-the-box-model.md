---
title: "Don't Inherit the Box Model | OddBird"
pubDate: '2026-11-26T11:08:01+05:30'
link: 'https://www.oddbird.net/2025/09/04/box-model/'
tags:
  - 'css'
---

> While inheritance is a core concept in CSS, only a small minority of properties ever do it. Inheritance is part of the ‘defaulting’ process, which determines what to do when no value has been explicitly provided for a given property on a given element. Some properties, like `color` and `font` revert to the value used on the parent element. They _inherit_ the value. But most of the properties we use – `background`, `border`, `margin`, `padding`, `display`, and so on – revert instead to their _initial_ value defined in the specification.
>
> There are more properties in each category, but I think at this point the distinction should be clear. Some properties apply to _the contents_, and those are the properties that inherit. Other properties apply to _the box_, and do not inherit.
