# Agent Instructions: Partner Boot Camp

Static site, no build. See README.md for structure and the Kit setup.

## Rules

- Copy and tone come from the Google Doc "Partner Boot Camp - Brand Guideline v2".
- No military imagery or language of any kind (camo, stencils, khaki, ranks, dog tags, badges, drill sergeants).
- No husband/wife binary in UI or copy. Use "you" and "your partner".
- Never shame anyone. The partner invite is a gift, never a fix.
- Always spell her name "Krysta", and when the two are named together it is "Krysta and Ryan", Krysta first. No emojis. No em dashes in any output.
- No secrets client-side. Kit is reached only through its public form endpoints.
- Every animation needs a reduced-motion path, and content must read fine with JS off.
- Keep vendored library versions pinned; update `vendor/` deliberately.

## Verify before shipping

Serve locally (`python3 -m http.server 8793`), check 375 / 768 / 1280 with no horizontal scroll and no console errors. The in-app browser pane stalls requestAnimationFrame; shim it to a timer when testing motion.

## Deploy

Push to `main`. GitHub Pages serves the repo root.
