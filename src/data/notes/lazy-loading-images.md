---
pubDate: '2026-11-26T12:43:18+05:30'
tags:
  - 'html'
  - 'images'
  - 'web-performance'
---

Today I learned, via [Calibre's article on Lazy Loading Images](https://calibreapp.com/blog/native-lazy-loading#how-far-ahead-each-browser-fetches-lazy-images), there is a difference in how far ahead each browser fetches lazy images.

> | Browser    | Images       | Iframes | Video and audio |
> | ---------- | ------------ | ------- | --------------- |
> | Chrome, 4G | 1,250px      | 2,500px | 1,250px         |
> | Chrome, 3G | 2,500px      | 3,500px | 2,500px         |
> | Chrome, 2G | 6,000px      | 6,000px | 6,000px         |
> | Firefox    | 600px        | 600px   | Not supported   |
> | Safari     | One viewport | 0px     | Not supported   |

Additionally, there is a difference in how horizontal lazy loading works in Chrome, Safari and Firefox. Via [web.dev's article on Browser-level image lazy loading for the web](https://web.dev/articles/browser-level-image-lazy-loading#:~:text=Chrome%20121%20changed,Safari%20and%20Firefox.):

> Chrome 121 changed the behavior for horizontal-scrolling images like carousels. These now use the same thresholds as vertical scrolling. This means for the carousel use case, images will be loaded before they visible in the viewport. This means the image loading is less likely to be noticeable to the user, but at the cost of more downloads. Use the Horizontal Lazy Loading demo to compare behaviour in Chrome versus Safari and Firefox.
