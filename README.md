# arpit.blog

Personal blog. Astro 6 static site, layered CSS, Pagefind for search.

## Commands

- `npm run dev` — dev server at `localhost:4321`
- `npm run build` — type-check then build to `./dist/`
- `npm run preview` — serve the built `dist/` locally
- `npm run books:colors` — extract dominant colors from book covers and write them to `books.json`

## Content

All content lives in `src/data/`. Add a file to the relevant directory; Astro picks it up automatically.

- `src/data/notes/` — short-form notes (Markdown/MDX, date-based URLs)
- `src/data/articles/` — long-form articles (Markdown/MDX, require `title`)
- `src/data/links/` — curated links (Markdown/MDX, require `title` and `link`)
- `src/data/books.json` — reading library; `status` is `read`, `reading`, or `unread`

## CSS

Cascade layer order: `reset → theme → global → composition → blocks → utilities → exceptions`.

- **theme/** — design tokens: type scale (Utopia), space scale, colors (`oklch`, `light-dark()`), typography
- **composition/** — layout primitives (`.stack`, `.cluster`, `.sidebar`, `.flow`, etc.)
- **blocks/** — component styles scoped to a named element
- **exceptions/** — page-scoped overrides (`entry-page.css`, `feed-page.css`, etc.)
