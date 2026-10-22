# Eluthu · எழுத்து

Eluthu turns handwriting into a downloadable Latin font entirely in the browser. Draw each letter, upload individual photos, or trace a printed sheet. The app stores projects in IndexedDB on the current device and makes OTF, TTF, WOFF2, ZIP, and an HTML specimen locally. It has no server or analytics.

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, code structure, and pull request guidance.

## Run locally

Use Node.js 22.13+ and pnpm 11. Corepack can install the version declared in `package.json`.

```sh
pnpm install
pnpm dev
```

Open the URL printed by Vite. `pnpm build` checks TypeScript and produces `dist/`; `pnpm test` runs the logic tests. The app is a static site, so the built `dist/` directory can be served by any static host with a fallback to `index.html` for `/design`.

## Use it

1. Choose **Write it** to draw with mouse, pen, or touch, or **Upload it** to provide a photo of each letter or a whole sheet.
2. Work through the Letter Coach. You can jump to a letter, skip one, and return through the review screen.
3. Open **Review** to inspect letters, adjust their outlines and spacing, and type a sample in the live font. Letter widths follow the ink outline automatically; the editor can override an individual width, and the preview spacing control adds tracking.
4. Open **Export** to download a font or a ZIP containing every format and the specimen.

The printable A4 sheet is available as PNG or PDF from the home and sheet screens. A sample photo is available in the individual upload flow. Projects are saved automatically; save a project JSON copy from Export and open it from Export. The hidden `/design` route documents the live UI kit.

## Architecture

| Area | Purpose |
| --- | --- |
| `src/lib/charset.ts` | Single ordered 89-character Basic Latin and punctuation configuration |
| `src/store.ts`, `src/lib/model.ts`, `src/lib/storage.ts` | Project state, actions, and IndexedDB persistence |
| `src/features/coach`, `draw`, `upload` | Guided capture, vector drawing, and photo/sheet upload |
| `src/lib/imaging`, `src/workers/imaging.worker.ts` | Binarization, sheet registration and perspective correction, component grouping, and Potrace tracing |
| `src/features/review` | Specimen grid, letter editing, font settings, and live text preview |
| `src/lib/font`, `src/workers/font.worker.ts` | Font generation, format conversion, validation, and specimen packaging |
| `src/styles`, `src/features/home/Design.tsx` | Paper and ink design tokens and living style guide |

Image processing and font generation run in module Web Workers. A single uploaded letter is downscaled to 640 pixels on its longest side; sheet detection uses up to 1800 pixels. Sheet cells are cropped and sent through the single-letter tracer one at a time. Font previews use a browser `FontFace` built from the current project.

## Checks and visual QA

Run `pnpm test` and `pnpm build`. Browser scripts in `scripts/` exercise drawing, upload, template detection, PDF generation, and all three font signatures. `scripts/qa.mjs` captures all nine primary screens at 375, 768, and 1440 pixels in the wine red and light sand theme. The generated PDF was rendered and visually inspected at A4 size.

## Current limits

- Basic Latin and the listed punctuation are supported. Tamil appears in the brand name only; adding Tamil glyphs requires a future character set and shaping work.
- Free-form sheet detection uses connected components and row clustering. Closely touching letters and very uneven lighting may need manual box adjustment or individual uploads.
- The sheet editor supports moving, resizing, merging with the next box, splitting, deleting, and reassigning boxes. It does not yet offer a separate **mark missing** control; delete an incorrect box, then use **Write missing letters**.
- The letter editor offers anchor movement, alignment, simple transforms, and a spacing slider. Curve anchor editing, rotation, individual sidebearing guides, and robust curve offsetting need a more advanced editor.
- Upload thresholding uses Otsu plus the user’s sensitivity adjustment; local adaptive thresholding is not yet implemented.
- The live font may use serif fallback for letters that have not been created. Export warns about these and still creates the available font.
- The home wordmark uses the self-hosted Jua font, chosen as a close match to the reference. UI icons are Lucide SVGs; only the supplied header logo is an image.
- No Lighthouse score has been claimed. The browser build and responsive screenshots were checked, but performance depends on the device and the size of uploaded photos.

## Design decisions and licensing

The ordered set contains 89 characters because it includes the full punctuation list. The interface uses a single wine red and light sand palette implemented in `src/styles`. On narrow screens the review editor becomes a full-width panel so the lettering remains legible. The grid uses compact tiles at 375 pixels rather than shrinking letterforms further.

Eluthu's source code is licensed under [GPL-2.0-only](LICENSE), because its Potrace tracing dependency uses GPL-2.0. Contributions to this repository are under the same license. Self-hosted Jua, Berkshire Swash, Fraunces, Inter, and Noto Serif Tamil fonts have separate [SIL Open Font License notices](public/licenses). Other dependency notices are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and `public/licenses/dependencies/`. Fonts that users export from their own handwriting are their own works; the app's source license does not automatically license those exports.
