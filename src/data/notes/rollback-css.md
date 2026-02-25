---
pubDate: "2026-02-25T10:10+0530"
tags:
  - "cascade"
  - "css"
---

I keep forgetting how each of the following CSS values rolls back a declaration to a different point in the cascade. It was about time I jotted it down for my future self before it slips my mind again for the 1000th time.

<dl class="flow">
	<div>
		<dt>
			<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/initial">
				<code>initial</code>
			</a>
		</dt>
		<dd>Applies the default value as listed in the CSS spec</dd>
	</div>
	<div>
		<dt>
			<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/unset">
				<code>unset</code>
			</a>
		</dt>
		<dd>Inherits or falls back to spec default value</dd>
	</div>
	<div>
		<dt>
			<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/revert">
				<code>revert</code>
			</a>
		</dt>
		<dd>Reverts to the user agent's default value</dd>
	</div>
	<div>
		<dt>
			<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/revert-layer">
				<code>revert-layer</code>
			</a>
		</dt>
		<dd>Rolls back to the value in a previous cascade layer</dd>
	</div>
</dl>
