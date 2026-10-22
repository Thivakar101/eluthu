# Eluthu design system

## Supplied visual reference

The home page follows the supplied 802 x 521 mockup: light sand (#F5EBD0), wine red (#7F011F), rounded eluthu lettering, two red action cards, and a small download link. The original logo is used in the header.

The wordmark is selectable HTML text in self-hosted [Jua](https://fonts.google.com/specimen/Jua), the closest visual match selected after comparing Jua, Baloo 2, Lilita One, and DynaPuff. It is an approximation, not an exact identification of the reference font. Labels use self-hosted Inter. Both font licenses are in `public/licenses/`. Only the header logo (`public/brand/logo.png`) is a raster UI asset. [Lucide Camera](https://lucide.dev/icons/camera), [Sparkle](https://lucide.dev/icons/sparkle), and Download are inline SVG components from the existing `lucide-react` dependency. No part of the reference screenshot is shipped in the application. User font previews continue to show the generated handwriting, with Fraunces for missing characters.

## Layout and controls

`src/styles/tokens.css` defines the palette. `src/styles/brand.css` applies the reference to all screens. Use sand and wine red throughout, short sentence-case labels, rounded red cards, thin outline icons, and no decorative grain or shadows. The home grid scales with the viewport; below 700px, the wordmark and action cards stack vertically. Live type scales with its container. Short windows can scroll; do not clip content to force a fixed page height.

Mobile screens use larger touch targets and a separate row for pen thickness. Inputs use at least 16px text to avoid focus zoom. Safe-area padding accounts for phone notches and home indicators. The drawing canvas responds to available screen height while keeping a usable minimum. On laptops, the drawing actions and review link share a row. On phones, export downloads appear before the specimen. The review size and spacing sliders remain functional at every width; avoid overriding their inline values with `!important`.

Drawing, upload, review, export, and completion retain their functionality with the same minimal styling. Editing surfaces use a thin wine red border. Primary controls are red with sand text. Secondary controls use a thin outline. The logo returns to Home. Existing handwriting resumes through Write it; saved project files can be opened from Export.

Focus outlines, accessible labels, reduced motion, and status announcements remain available. Avoid adding promotional text, ornamental labels, or extra colors.

## Visual checks

`scripts/qa.mjs` records the home page at the reference dimensions and all nine primary screen states at 375, 768, and 1440 pixels. `scripts/overflow-check.mjs` checks eight user-facing states at twelve viewport sizes, including 320px phones, landscape, and 1280 x 720 / 1366 x 768 laptops. It verifies live text, local fonts, absence of screenshot slices, clipping, and visible laptop drawing actions. Screenshots are saved in `docs/screens/`. Run `scripts/flow-check.mjs` to exercise drawing, persistence, downloads, and both upload paths, and `scripts/mobile-check.mjs` for touch drawing, mobile preview controls, settings, and font download.
