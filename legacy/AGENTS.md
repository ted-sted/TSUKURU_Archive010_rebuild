# AGENTS.md

## Project type
- Static GitHub Pages site.
- Entry point: index.html
- Keep relative paths working (assets/, audio/, og-image.png).

## Constraints
- Do not remove or rename existing files/folders unless explicitly instructed.
- Prefer minimal diffs; do not introduce build tools or new dependencies.
- Do not change the meaning of existing text content without asking.
- After edits, verify by running a local static server and checking the page renders.

## Verification
- Start a local server (python3 -m http.server 8000) and open http://localhost:8000
- Confirm: no broken images/audio, no console errors, layout is acceptable at mobile and desktop widths.
