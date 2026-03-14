---
pubDate: "2026-03-14T14:43+0530"
tags:
  - "css"
  - "custom-properties"
  - "variables"
---

What happens in CSS when `var()` references a custom property that is undefined or explicitly set to `initial`?

In both cases the custom property's value is the [<i>guaranteed-invalid value</i>](https://drafts.csswg.org/css-variables/#guaranteed-invalid-value). That's the initial value of every custom property as defined in the spec. When `var()` encounters this value during substitution, here's what happens:

1. If a fallback was provided, the fallback value is used.
2. If no fallback was provided, the referencing property becomes [<i>invalid at computed-value time (IACVT)</i>](https://www.w3.org/TR/css-variables-1/#invalid-at-computed-value-time). The property then behaves as if its value had been specified as the `unset` keyword.
