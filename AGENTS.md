# AI / Codex Operating Rules (TSUKURU_Archive010_rebuild)

## Non-negotiables
1) Do NOT modify `legacy/**` at any time. Treat it as read-only.
2) Only modify files under `new/**` (and tooling under `tools/**`, `docs/**`, `.github/**`, `package.json`).
3) Preserve all visible text and DOM invariants:
   - `npm test` must pass before any commit.
   - CI enforces visible-text parity and DOM parity (ids + key anchors).

## Selector discipline (no guessing)
- Use `docs/dom-inventory.md` as the source of truth for IDs/landmarks.
- Do not introduce new selectors or IDs unless explicitly required and approved.

## Safe workflow
- Work on feature branches only.
- Small, atomic changes (one purpose per commit).
- After changes:
  - run `npm test`
  - visually verify `http://localhost:5174` (new)

## Logging / stability
- Keep diagnostics header in `new/assets/site.js`.
- Avoid breaking initialization timing; scripts are loaded with `defer`.

