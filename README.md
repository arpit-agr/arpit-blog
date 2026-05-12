# arpit.blog

Personal blog of [Arpit Agrawal](https://arpit.blog) — notes, articles, curated links, and a reading library.

Built with [Astro](https://astro.build), TypeScript, and layered CSS. Content is authored in Markdown/MDX and managed via Astro's content collections.

## Stack

- **Framework:** Astro 6 (static output)
- **Content:** Markdown, MDX — notes, articles, links, books (JSON)
- **Styles:** Cascade layers, CSS Utopia (responsive type/space scale), `oklch` color, `light-dark()`
- **Search:** Pagefind (client-side, no backend)
- **Fonts:** Figtree variable font, subsetted

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Type-check and build to `./dist/` |
| `npm run books:colors` | Extract dominant colors from book covers |
