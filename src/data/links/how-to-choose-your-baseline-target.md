---
title: "How to choose your Baseline target  |  Articles  |  web.dev"
pubDate: "2026-01-05T13:52+0530"
link: "https://web.dev/articles/how-to-choose-your-baseline-target"
tags:
  - "baseline"
  - "browser-support"
  - "progressive-enhancement"
  - "analytics"
via:
  url: "https://frontendmasters.com/blog/browserslist-baseline/"
  label: "Browserslist & Baseline – Frontend Masters Blog"
---

Jeremy Wagner and Rachel Andrew explain how to use analytics to select a Baseline target and what to do when you don't have any real user data. 

In cases where there isn't any real user data:

> […] you can get a general idea of support for different Baseline targets through [RUM Archive Insights](https://rumarchive.com/insights/#baseline), even allowing you to filter down to the country level.

They also address a practical follow-up question: **what to do about features that don’t meet your chosen Baseline target.**

Baseline doesn’t prescribe a specific path here, but the authors suggest a useful framework for categorizing features based on their "failure mode":

> - **Enhancement:** If the feature is used in an unsupported browser, the experience is not broken. The experience could possibly be degraded, but may not likely be noticeable to the user. Example: `loading="lazy"`.
> - **Additive:** The feature provides some additive benefits that may be noticeable—such as changes in page styling or some functionality. The difference may not be noticeable to users if the feature is unsupported, barring comparison in a browser that does support it. Example: Subgrid
> - **Critical:** If the feature is unsupported, the user will have a negative user experience—possibly even one that's broken altogether. Example: File System Access API used as a central and necessary feature.

They also highlight [Clearleft's browser support policy](https://browsersupport.clearleft.com/), where they target Baseline Widely available while still evaluating whether newer features can be used as progressive enhancements before ruling them out entirely.
