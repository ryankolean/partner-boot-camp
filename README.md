# Partner Boot Camp

Storybook landing page and waitlist for Partner Boot Camp, an inclusive couples program by Krysta and Ryan (Summit Software Solutions).

Live: https://ryankolean.github.io/partner-boot-camp/

Source of truth for copy, tone, and visuals: Google Doc "Partner Boot Camp - Brand Guideline v2".

## Stack

No build step. Static HTML, CSS, and vanilla JS served by GitHub Pages from `main` (root).

- `index.html`: the page, chapter by chapter
- `welcome.html`: landing page for partner invites sent before the email-only change
- `capsules/`: the capsule library and one folder per capsule
- `css/styles.css`: tokens and layout
- `css/capsules.css`: shared styles for the library and every capsule page
- `js/early.js`: sets `js-motion` before first paint so the hero intro does not flash
- `js/main.js`: motion (GSAP, ScrollTrigger, DrawSVG, SplitText, Lenis) and the bookshelf
- `js/capsule.js`: motion for capsule pages, including the scroll-drawn loop
- `js/signup.js`: email-only Kit waitlist signup
- `vendor/`: pinned GSAP 3.15.0 and Lenis 1.3.26 builds
- `tools/og.html`: source for `assets/og.png` (regenerate with headless Chrome, see below)

Run locally:

```bash
python3 tools/serve.py 8812
```

## Capsules

A capsule is a free, short exercise built on one idea. Each one is a real HTML page, so there is nothing to compile. `capsules/the-blank-test/` is the template.

To add one:

1. Copy `capsules/the-blank-test/` to `capsules/<slug>/` and replace the copy. Update the title, description, and `og:url` in the head. Keep the same `<section>` order: hero, the idea, the loop, why it happens, try it together, swap the line, one week of practice, join, sources.
2. Redraw the loop for the new concept (see below), or delete that section if the idea has no cycle worth drawing.
3. Add a card to `capsules/index.html`. Newest goes first.
4. To feature it on the landing page, point `.teaser` in `index.html` at it.

The loop is two inline SVGs, because a wide diagram is unreadable on a phone: `data-loop="wide"` shows from 640px up and `data-loop="tall"` below that. `js/capsule.js` animates whichever is showing:

- Each `[data-step]` group draws in DOM order, so the DOM order is the story order.
- A group with `data-pause` waits first. Use it before the ways out.
- Draw each arrowhead as its own `<path>`. Browsers restart dashes for each subpath, so a head inside the line's path draws too early.
- Class `art__accent` marks the ways out, and `loop__tint` fades a box's fill in with its text.
- Both SVGs are `aria-hidden`, so keep the `.sr-only` list in step with them. It is the text version of the diagram.

Credit the source by name and link to it, paraphrase it, and never embed its clips or frames. Cite studies for what they show, and keep the "patterns, not causes" caveat where it applies.

## Kit

Account: Partner Boot Camp (login in 1Password). The site posts to Kit's public form endpoints; no API keys in the repo.

| Thing | Name | ID |
|---|---|---|
| Form | Partner Boot Camp Waitlist (auto-confirm, welcome email) | 10077301 |
| Form | Partner Boot Camp Partner Invite (double opt-in, invite email) | 10077317 |
| Tag | waitlist | 24868778 |
| Tag | invited-partner | 24868779 |
| Custom fields | partner_name, partner_email, partner_note | |

How a signup flows:

1. The form asks for an email only. It posts to the waitlist form with `tags[]=waitlist`; Kit sends the welcome email right away (auto-confirm).
2. If Kit's bot guard answers `status: "quarantined"`, the page shows an "Almost there" step with a link to Kit's quick check.
3. After signing up, a "Share with your partner" button opens the share sheet (or copies the page link).

The Partner Invite form (10077317) and the partner_* fields are no longer used by the page. `welcome.html` stays up for invites sent before the change.

## Book covers

Spines and covers on the reading list are CSS recreations of each book's real design. The heart on the Atlas of the Heart cover (`assets/atlas-heart.jpg`) is cropped from the publisher's cover image (Penguin Random House, ISBN 9780399592553) and used to recommend the book.

## Placeholders

Search for `data-placeholder`: Krysta's quote and two couple photos.

## Share image

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=1200,630 --virtual-time-budget=6000 --screenshot="$PWD/assets/og.png" "file://$PWD/tools/og.html"
```
