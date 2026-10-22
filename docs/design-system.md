# Eluthu design system

## Milk and orange

The interface uses a milk canvas (`#FDFDF1`) and a vivid orange (`#EC5E27`). The orange appears in primary actions, the main capture card, illustration, focus, and display accents. Dark brown keeps small copy readable. Each screen has one prominent action, with shadow reserved for floating tools and the letter editor.

## Color

The source of truth is `src/styles/tokens.css`. Components use the named variables rather than literal colors.

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#FDFDF1` | Page background |
| `--paper-raised` | `#FFFEF8` | Sheets and cards |
| `--paper-sunken` | `#F7EFE1` | Wells and missing tiles |
| `--ink` | `#28170F` | Main text and strokes |
| `--ink-soft` | `#5A4031` | Supporting text |
| `--ink-faint` | `#796251` | Guides and placeholders |
| `--line` | `#EAD9C5` | Hairlines |
| `--line-strong` | `#DDBEA5` | Strong borders and baseline |
| `--accent` | `#EC5E27` | Orange fills and large display accents |
| `--accent-ink` | `#AE3E11` | Small orange text with stronger contrast |
| `--accent-wash` | `#FFE5D4` | Selected surfaces |

`--success`, `--warn`, and `--danger` signal status without overtaking the page. The app has one palette, independent of operating system theme settings.

## Type and layout

- Berkshire Swash, an open-licensed retro display serif, is used for headings, the wordmark, and the large prompted letter. Inter is used for controls and reading copy. Fraunces remains a fallback for missing glyphs in the user's generated font preview. Noto Serif Tamil is limited to the Tamil wordmark subtitle.
- Content width is capped at 1120px; the Letter Coach uses a narrower 760px column.
- Body copy uses a relaxed line height and short measure. Micro labels are sparing, uppercase, and letter-spaced.
- Controls are pill-shaped; cards and glyph tiles use rounded corners and one-pixel borders. The drawing surface has a larger 24px radius.
- The fixed paper grain is a barely visible SVG noise layer.

## Motion and interaction

The motion vocabulary is fade, slight vertical travel, and restrained scaling with `cubic-bezier(.22,1,.36,1)`. The coach prompt blurs softly during letter changes. Glyph tiles arrive in a short stagger; traced ink reveals from left to right. A progress line grows in place. Reduced-motion users get simplified transitions.

Interactive controls have visible focus, hover, press, disabled, and busy states. The drawing surface prevents touch scrolling during a stroke. Icon-only controls have accessible labels and native title tooltips. Status and errors use live regions where their timing matters.

## Living reference

Open `/design` while running the app to view color, typography, components, and motion on the actual site. The screenshot set in `docs/screens/` records the primary screens at mobile, tablet, and desktop widths.
