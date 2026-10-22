# Contributing to Eluthu

Thanks for helping make handwriting fonts easier to create. Bug fixes, accessibility improvements, documentation, translations, and focused feature work are welcome.

## Start here

1. Install Node.js 22.13+ and enable Corepack (`corepack enable`). The repository pins pnpm in `package.json`.
2. Run `pnpm install --frozen-lockfile`, then `pnpm dev`.
3. Before opening a pull request, run `pnpm test` and `pnpm build`.

The browser app has no backend. A saved project stays in the browser's IndexedDB; use **Export → Save project** before clearing site data. Please use synthetic handwriting in screenshots and bug reports rather than uploading private project data.

## Find the right code

The [README architecture table](README.md#architecture) maps the main features. `src/lib/model.ts` defines a project, `src/store.ts` owns editor actions, and `src/lib/storage.ts` persists a project. Imaging and font generation run in Web Workers. Keep the 89-character ordering in `src/lib/charset.ts` consistent across capture, review, and export.

## Make a change

- Open an issue for larger changes so the interaction and data model can be discussed first. Small fixes can go straight to a pull request.
- Keep the change focused. Explain the user-facing behavior, any migration of saved projects, and how you verified it.
- Add or update a test when changing nontrivial logic. For visual changes, include before and after screenshots at a narrow and wide viewport.
- Preserve keyboard use, readable contrast, and touch targets. Check both light and dark themes when editing shared styles.
- Do not commit generated `dist/`, `node_modules/`, personal projects, credentials, or environment files.

Pull requests should target `main`. CI runs tests and a production build. By submitting a contribution, you agree to license it under the repository's [GPL-2.0-only license](LICENSE). Dependencies and bundled fonts keep their own licenses; update [third-party notices](THIRD_PARTY_NOTICES.md) when adding or replacing one.

For security issues, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.
