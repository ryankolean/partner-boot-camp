# Partner Boot Camp

Storybook landing page and waitlist for Partner Boot Camp, an inclusive couples program by Krysta and Ryan (Summit Software Solutions).

Live: https://ryankolean.github.io/partner-boot-camp/

Source of truth for copy, tone, and visuals: Google Doc "Partner Boot Camp - Brand Guideline v2".

## Stack

No build step. Static HTML, CSS, and vanilla JS served by GitHub Pages from `main` (root).

- `index.html`: the page, chapter by chapter
- `welcome.html`: landing page after an invited partner clicks "Count me in"
- `css/styles.css`: tokens and layout
- `js/early.js`: sets `js-motion` before first paint so the hero intro does not flash
- `js/main.js`: motion (GSAP, ScrollTrigger, DrawSVG, SplitText, Lenis) and the bookshelf
- `js/signup.js`: two-step Kit signup with the optional partner invite
- `vendor/`: pinned GSAP 3.15.0 and Lenis 1.3.26 builds
- `tools/og.html`: source for `assets/og.png` (regenerate with headless Chrome, see below)

Run locally:

```bash
python3 tools/serve.py 8812
```

## Kit

Account: Partner Boot Camp (ryan.kolean+partnerbootcamp@gmail.com). The site posts to Kit's public form endpoints; no API keys in the repo.

| Thing | Name | ID |
|---|---|---|
| Form | Partner Boot Camp Waitlist (auto-confirm, welcome email) | 10077301 |
| Form | Partner Boot Camp Partner Invite (double opt-in, invite email) | 10077317 |
| Tag | waitlist | 24868778 |
| Tag | invited-partner | 24868779 |
| Custom fields | partner_name, partner_email, partner_note | |

How a signup flows:

1. Step 1 collects first name and email. Nothing is sent yet.
2. Step 2 is optional. "Send the invite" or "Just me for now" submits the waitlist form once, with `tags[]=waitlist` and, when inviting, the partner fields.
3. When inviting, the partner is also submitted to the Partner Invite form with `tags[]=invited-partner`. Kit sends them one confirmation email, written as the invite. They join only if they click "Count me in", which lands on `welcome.html`.
4. If someone leaves during step 2, a `sendBeacon` still saves their spot.

The `partner_*` fields are symmetric: on each record they describe that person's partner. The invite email reads `{{ subscriber.partner_name }}` and `{{ subscriber.partner_note }}` from the invited partner's record.

## Book covers

Spines and covers on the reading list are CSS recreations of each book's real design. The heart on the Atlas of the Heart cover (`assets/atlas-heart.jpg`) is cropped from the publisher's cover image (Penguin Random House, ISBN 9780399592553) and used to recommend the book.

## Placeholders

Search for `data-placeholder`: Krysta's quote and two couple photos.

## Share image

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=1200,630 --virtual-time-budget=6000 --screenshot="$PWD/assets/og.png" "file://$PWD/tools/og.html"
```
