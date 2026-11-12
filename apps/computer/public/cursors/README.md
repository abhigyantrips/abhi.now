# Streamline Plump Remix cursors

Artwork by [Streamline](https://www.streamlinehq.com/), licensed under
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).

Source: [Streamline's open-source vector collection](https://github.com/webalys-hq/streamline-vectors),
obtained through `@iconify-json/streamline-plump@1.2.0`.
The selected application artwork is recorded in `src/data/computer-icons.json`.

| File | Original asset | Hotspot (32px image) |
| --- | --- | --- |
| `cursor.svg` / `cursor.png` | `arrow-cursor-1-remix` | `4 4` |
| `click.svg` / `click.png` | `one-finger-tap-remix` | `13 9` |
| `busy.svg` / `busy.png` | `hourglass-remix` | `16 16` |

Modifications: fixed 32px dimensions, padding, and colors matching the site's palette.
The base files use warm brown (`#3c3836`) ink with a cream (`#fffaed`) interior and outline.
The corresponding `-dark.svg` / `-dark.png` variants use beige (`#ebdbb2`) ink with a charcoal
(`#1d2021`) interior and outline.
The CSS switches variants with the site's theme toggle.
PNGs are rasterized fallbacks of the SVGs, with identical dimensions and hotspots.
The original application icon paths are unmodified and use `currentColor`.

The CSS uses the browser's native cursor support. Mark an asynchronous region
with `aria-busy="true"` to use the hourglass. Inputs and textareas retain the
native text cursor, and disabled controls retain `not-allowed`.

Cross-origin iframe documents control their own cursors. Matching cursors inside
`abhi.now` require adding the cursor styles and attribution to that site too.
