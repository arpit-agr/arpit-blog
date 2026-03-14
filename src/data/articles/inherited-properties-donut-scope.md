---
title: "Inherited properties leak through the donut scope"
pubDate: "2026-03-14T12:39+0530"
tags:
  - "scope"
  - "css"
---

Today I learned about a potential pitfall with `@scope`.

Via [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@scope) [emphasis mine]:

> It is important to understand that, while `@scope` allows you to isolate the application of selectors to specific DOM subtrees, it does not completely isolate the applied styles to within those subtrees. This is most noticeable with inheritance — **properties that are inherited by children (for example `color` or `font-family`) will still be inherited, beyond any set scope limit.**

In other words, `@scope` isolates your selectors, not your styles. Here's what that looks like in practice.

```html
<article class="card">
  <p>In scope</p>
  <div class="content">
    <p>Outside the scope limit</p>
  </div>
</article>
```
		
```css
@scope (.card) to (.content) {
  :scope {
    color: red;
    font-family: Georgia, serif;
  }

  p {
    padding: 1lh;
    outline: 1px solid;
  }
}
```

The second `<p>`, the one inside `.content`, won't get the `padding` or `outline` because those are non-inherited properties in the scope limit. That part works exactly as you'd expect.

But it will still turn red and render in Georgia because `color` and `font-family` are inherited properties set on `.card` (via `:scope`). And as we just learned from MDN, inheritance flows through the DOM regardless of where `@scope` sets the scope limit.

As Miriam mentioned in the [Winging It episode on CSS Scope & Mixins](https://www.youtube.com/watch?v=T-X641Qn-Rc&t=1838s), it has to work this way because if `@scope` blocked inheritance at the scope limit, every element beyond the scope limit would receive the initial value for each inherited property. 

[`initial`](https://arpit.blog/notes/2026/02/rollback-css/) applies the value as defined in the CSS spec. And that would be far more destructive than letting inheritance flow through.

If you're coming from JavaScript, you might expect custom properties to work like scoped variables work in JavaScript. But in CSS, custom properties are inherited properties just like `color` or `font-family`.

```css
@scope (.card) to (.content) {
  :scope {
    --text-color: red;
    font-family: Georgia, serif;
  }

  p {
    color: var(--text-color);
    padding: 1lh;
    outline: 1px solid;
  }
}

/* This rule exists to show that the inherited value is available beyond the scope limit */
.content p {
	color: var(--text-color);
}
```

With the same HTML, the second `<p>` again loses the `padding` and `outline`. But `--text-color` inherits down from `.card` into `.content p`. So the second `<p>` also turns red because its `color` property references `var(--text-color)` which resolves to `red`.

For custom properties, if inheritance were blocked at the scope limit and no ancestor outside the scope had also defined it, any `var(--text-color)` beyond the scope limit would just trigger the fallback in the `var()` function, or if there's no fallback, the property using it would behave as [`unset`](https://arpit.blog/notes/2026/02/rollback-css/).
