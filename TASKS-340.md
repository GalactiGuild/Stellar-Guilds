# Stellar-Guilds Issue #340 — Markdown Sanitization Utility

## Scope
Create an isolated backend sanitizer utility for markdown/HTML payloads using DOMPurify + JSDOM, with explicit allow-lists and tests.

## Completed
- [x] Branch `feat/markdown-sanitization-util` created from current main.
- [x] Added backend dependencies `dompurify`, `jsdom@24.1.3`, and `@types/jsdom@21.1.7`.
- [x] Added `SanitizationUtil.cleanMarkdown(input: string): string`.
- [x] Added immutable explicit allowed tag list including `a`, `p`, `b`, `i`, `h1`, markdown/code/table tags, and explicit allowed attrs.
- [x] Strips `<script>alert(1)</script>` and dangerous tags/attrs while preserving markdown text such as `**bold**`, `# Headers`, GFM table syntax, and strikethrough markers.
- [x] Added unit tests covering scripts, allowed HTML, event handlers/styles/images, javascript URLs, GFM text, and frozen allow-lists.
- [x] Validation: `cd backend && npm test -- src/common/utils/sanitization.util.spec.ts` PASS.
- [x] Validation: `cd backend && npm run build` PASS.

## Error note
- Initial `jsdom` latest install pulled ESM-only transitive code that Jest could not parse. Fixed by pinning `jsdom@24.1.3` with matching `@types/jsdom@21.1.7`.

## Non-goals / Safety
- Utility only; no route wiring.
- No external calls.
- No wallet signing, funds movement, or backend data mutation.
