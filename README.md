# J.I.M — Joy In Movement

Static website for J.I.M (infrared fitness studio), built from the Figma design.

## Project structure

```
joyinmovement/
├── index.html            # Home
├── about.html
├── articles.html
├── classes.html
├── how-it-works.html
├── infrared.html
├── locations.html
├── own-a-jim.html
├── press.html
│
├── css/
│   ├── home.css          # Base styles (header, footer, shared sections) — used by most pages
│   ├── style.css         # Base styles for own-a-jim.html and how-it-works.html
│   └── <page>.css        # Page-specific styles, loaded after the base stylesheet
│
├── js/
│   └── script.js         # Shared JS (mobile nav, etc.) — loaded on every page
│
├── assets/               # Images used by the pages
│   └── _unused/          # Images exported from Figma but not referenced by any page
│
├── docs/
│   └── screenshots/      # Full-page renders + Figma reference screenshot
│
└── tools/
    └── figma/            # Node scripts used to inspect/export assets via the Figma API
```

## Running locally

No build step — open `index.html` in a browser, or serve the folder:

```sh
npx serve .
```

## Figma tools

The scripts in `tools/figma/` read `FIGMA_TOKEN` from `.env`. Copy `.env.example` to `.env`, add your token, and run scripts from the project root:

```sh
node tools/figma/dl_cards.js
```

## Formatting

Code is formatted with Prettier (`.prettierrc`):

```sh
npx prettier --write "*.html" "css/*.css" "js/*.js"
```
