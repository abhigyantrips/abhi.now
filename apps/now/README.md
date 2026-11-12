# Astro Starter Kit: Minimal

```sh
pnpm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Formatting

Run `pnpm format` to format application code and repository documentation, or
`pnpm format:check` to check it without writing files. Prettier uses the existing
Astro, TypeScript import-organizer, and Tailwind plugins. Tailwind sorting reads
`apps/now/src/styles/global.css` for this site's custom utilities and theme.

Authored files in the shared root `content/` directory,
public assets, generated files, and the migration coverage baseline are excluded
from bulk formatting. This keeps published Markdown/MDX and its whitespace intact.
Python utilities are outside Prettier's supported languages.

Prettier remains the chosen formatter for this repository. Oxfmt provides native
formatting for JS/TS and several other languages, built-in import sorting, and
Tailwind sorting. Its Astro and MDX support delegates to bundled Prettier, with
Astro additionally requiring `@astrojs/compiler-rs`. It does not load arbitrary
Prettier plugins, so its import sorting does not preserve our TypeScript language
service's sort/combine/remove behavior. All three apps already use the same
Prettier plugin configuration; retaining it avoids a formatter migration alongside
the repository migration.

References: [Oxfmt language support](https://oxc.rs/docs/guide/usage/formatter/language-support),
[plugin limitations](https://oxc.rs/docs/guide/usage/formatter/unsupported-features),
[sorting](https://oxc.rs/docs/guide/usage/formatter/sorting), and
[TypeScript import organizer](https://github.com/simonhaenisch/prettier-plugin-organize-imports).

## Snippet collections

Each folder in `../../content/snippets/` has an `_collection.json` containing
`name`, `description`, `permalink`, and `type` (`"text"` or `"photos"`). Omitted
`type` values default to `"text"`. The collection controls every post's type;
individual posts do not need their own `type` field.

```json
{
  "name": "out-and-about",
  "description": "things i saw while being out in the world.",
  "permalink": "out-and-about",
  "type": "photos"
}
```

Posts keep their unique 10-digit Unix timestamp filenames. Text posts are ordinary
Markdown. In a photo collection, each post requires a local `image` and nonempty
`imageAlt` in its frontmatter. Image paths are relative to the Markdown file;
`imageAlt` describes the image for accessibility, independently of the caption.
The Markdown body is the optional caption; don't repeat the main image in it.

```md
---
image: ./images/evening-walk.jpg
imageAlt: Sunlight falling across trees beside a walking path.
---

I just remember my legs hurting from the exertion.
It was an amazingly extroverted day.
```

Photos preserve their aspect ratios. They use 60% of the feed width from the `md`
breakpoint, alternating left and right among photo posts only, and the full feed
width on mobile. The same presentation applies to the mixed feed and folder
pages. The collection name links to its folder; the datetime links to the post.
RSS includes the frontmatter image before the caption, and photo folders have
photo previews in their social sharing images.
