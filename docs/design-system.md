# Eluthu design system

## Quiet stationery

The interface is a warm paper surface that frames the user’s ink. Each screen has one prominent action. Borders and tonal differences establish hierarchy; shadow is reserved for the floating tool pill and letter editor. The app avoids UI gradients, decorative accent color, and stock imagery.

## Color

The source of truth is `src/styles/tokens.css`. Components use the named variables rather than literal colors.

| Token | Paper | Midnight ink | Use |
| --- | --- | --- | --- |
| `--paper` | `#FAF8F5` | `#14130F` | Page |
| `--paper-raised` | `#FFFFFF` | `#1C1B16` | Sheets, cards |
| `--paper-sunken` | `#F3F0EA` | `#0F0E0B` | Wells, missing tiles |
| `--ink` | `#16150F` | `#F2EFE8` | Main text and strokes |
| `--ink-soft` | `#4A473F` | `#B9B4A7` | Supporting text |
| `--ink-faint` | `#8C877B` | `#7A756A` | Guides and placeholders |
| `--line` | `#E8E4DC` | `#2A2822` | Hairlines |
| `--line-strong` | `#D6D1C6` | `#3A372F` | Active borders and baseline |
| `--accent` | `#26335F` | `#AEB9E8` | Primary action, focus, current letter |
| `--accent-wash` | `#ECEEF6` | `#1E2237` | Selected surfaces |

`--success`, `--warn`, and `--danger` signal status without overtaking the page. Light and dark themes share spacing and type hierarchy. The manual theme toggle persists in local storage and defaults to the operating system preference.

## Type and layout

- Fraunces is used for editorial headings, the wordmark, and the large prompted letter. Inter is used for controls and reading copy. Noto Serif Tamil is limited to the Tamil wordmark subtitle.
- Content width is capped at 1120px; the Letter Coach uses a narrower 760px column.
- Body copy uses a relaxed line height and short measure. Micro labels are sparing, uppercase, and letter-spaced.
- Controls are pill-shaped; cards and glyph tiles use rounded corners and one-pixel borders. The drawing surface has a larger 24px radius.
- The fixed paper grain is a barely visible SVG noise layer. Its opacity and blend mode change with the theme.

## Motion and interaction

The motion vocabulary is fade, slight vertical travel, and restrained scaling with `cubic-bezier(.22,1,.36,1)`. The coach prompt blurs softly during letter changes. Glyph tiles arrive in a short stagger; traced ink reveals from left to right. A progress line grows in place. Reduced-motion users get simplified transitions.

Interactive controls have visible focus, hover, press, disabled, and busy states. The drawing surface prevents touch scrolling during a stroke. Icon-only controls have accessible labels and native title tooltips. Status and errors use live regions where their timing matters.

## Living reference

Open `/design` while running the app to view color, typography, components, and motion on the actual site. The screenshot set in `docs/screens/` records the primary screens at mobile, tablet, and desktop widths in both themes.
