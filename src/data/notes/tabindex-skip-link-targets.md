---
pubDate: '2026-05-21T15:01+0530'
tags:
  - 'html'
  - 'accessibility'
  - 'usability'
---

Today I learned, adding `tabindex="-1"` to skip link targets is likely no longer necessary in modern browsers.

Manuel Matuzović [tested skip links without `tabindex="-1"` on targets](https://www.matuzo.at/blog/2026/skip-links-tabindex) across major browsers and screen readers on macOS, Windows and Android, concluding it is safe to remove in most setups, thanks to [sequential focus navigation starting point](https://html.spec.whatwg.org/multipage/interaction.html#sequential-focus-navigation).

Furthermore, adding `tabindex="-1"` to skip link targets also introduces a regression in usability. With `tabindex="-1"` on `main`, clicking on any non-interactive area inside `main` makes `main` itself the focus starting point. So, the next tab press sends focus to the first focusable element in `main`, not the next one after where the user clicked. The gov.uk team [removed `tabindex` from `main`](https://github.com/alphagov/govuk_elements/pull/534) for this reason.
