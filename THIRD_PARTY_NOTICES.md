# Third-party notices

Eluthu's own source is [GPL-2.0-only](LICENSE). The following bundled direct runtime dependencies and fonts retain their respective licenses. Their full notices are copied under [`public/licenses/`](public/licenses), which is included in production builds.

| Component | License | Notice |
| --- | --- | --- |
| esm-potrace-wasm | GPL-2.0 | [License](public/licenses/esm-potrace-wasm-GPL-2.0.txt) |
| fonteditor-core | MIT | [License](public/licenses/dependencies/fonteditor-core-MIT.txt) |
| WOFF2 and Brotli code in the bundled WOFF2 WebAssembly module | MIT | [WOFF2](public/licenses/dependencies/woff2-MIT.txt), [Brotli](public/licenses/dependencies/brotli-MIT.txt) |
| framer-motion | MIT | [License](public/licenses/dependencies/framer-motion-MIT.txt) |
| JSZip | MIT option of MIT/GPL-3.0 dual license | [License](public/licenses/dependencies/jszip-MIT-or-GPL-3.0.txt) |
| lucide-react | ISC | [License](public/licenses/dependencies/lucide-react-ISC.txt) |
| opentype.js | MIT | [License](public/licenses/dependencies/opentype.js-MIT.txt) |
| perfect-freehand | MIT | [License](public/licenses/dependencies/perfect-freehand-MIT.txt) |
| React and React DOM | MIT | [React](public/licenses/dependencies/react-MIT.txt), [React DOM](public/licenses/dependencies/react-dom-MIT.txt) |
| Zustand | MIT | [License](public/licenses/dependencies/zustand-MIT.txt) |
| Berkshire Swash | SIL OFL-1.1 | [License](public/licenses/berkshire-swash-OFL.txt) |
| Fraunces | SIL OFL-1.1 | [License](public/licenses/fraunces-OFL.txt) |
| Inter | SIL OFL-1.1 | [License](public/licenses/inter-OFL.txt) |
| Jua | SIL OFL-1.1 | [License](public/licenses/jua-OFL.txt) |
| Noto Serif Tamil | SIL OFL-1.1 | [License](public/licenses/notoseriftamil-OFL.txt) |

Transitive dependencies are pinned in `pnpm-lock.yaml`; their own package metadata and license files are available after `pnpm install`. When updating a dependency, verify its license and refresh this list and the copied notices.
