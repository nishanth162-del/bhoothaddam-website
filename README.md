# Bhoothaddam — How Things Work, in 3D

The website for **Bhoothaddam**, a 3D visual-science channel
(Instagram [@bhoothaddam_3d](https://www.instagram.com/bhoothaddam_3d),
Facebook profile **Bhoothaddam D**, YouTube
[@bhoothaddam-3d](https://www.youtube.com/@bhoothaddam-3d)).

The site's job: pull reel viewers here for the full written breakdowns
behind the videos, then — once approved — link them on to the products
behind the explainers.

## What it is

- Clean editorial, text-first, fast, magazine-like. No images of people,
  no Pinterest content, no other channels or stores.
- Explainer index: the cofferdam, the UPI journey, the instant photo, the
  smartwatch heartbeat, the infrared beam — each written out step by step.
- Four Finds shelves, honestly marked **“Opens after approval”**. No
  affiliate links are live yet.
- A working Deal Checker: MRP vs offer price vs usual street price, with a
  verdict. It is a calculator, not a recommendation.
- “How we pick” rules, plus About, Affiliate Disclosure, Privacy and
  Contact pages, so reviewers can check the site properly.
- Responsive phone → laptop → desktop, light and dark mode.

## Built with the real Astryx library

This site is built with [Astryx](https://github.com/meta/astryx) —
Meta's open-source design system (MIT, beta), not an Astryx lookalike.

- `@astryxdesign/core` `^0.7.16` — the components
  (`Button`, `Card`, `Stack`, `Heading`, `Text`, `Badge`, `Banner`,
  `Divider`, `TextInput`, `Collapsible`, `Link`, `Section`, `Grid`)
- `@astryxdesign/theme-neutral` `^0.7.16` — the neutral theme, wired
  through the Astryx CLI (`astryx theme add neutral`, generated
  `src/astryx-themes.ts`)
- `@stylexjs/stylex` — the only custom styles, a small page shell
- React 19, TypeScript, Vite 8

Every visible control on the site is a real `@astryxdesign/core`
component. The CSS imports are exactly the ones in the Astryx README:
`@astryxdesign/core/reset.css`, `@astryxdesign/core/astryx.css`, plus
the theme stylesheet from `src/astryx-themes.ts`.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # tsc + vite build → dist/
npm run preview  # serve the production build locally
```

## Deploy (free)

GitHub Pages, from this repo. A push to `main` runs
`.github/workflows/deploy.yml`, which builds the site and deploys
`dist/` to Pages.

Live site: <https://nishanth162-del.github.io/bhoothaddam-website/>

The custom domain `bhoothaddam.in` is bought but **not yet pointed**
at this site — that is a separate step, after the live site is reviewed.

## Affiliate status

No affiliate links are live on this site. The Amazon Influencer
application is made **after** this site is live, and links appear only
once an application is approved. The old Associates ID
`goodstore065-21` is closed and must not be used anywhere; neither
must the old `wallclubs-21` tag.
