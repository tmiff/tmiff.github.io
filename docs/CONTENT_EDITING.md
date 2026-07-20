# Public Content Editing

## Source files

- English: `src/content/en/pages.json`
- Japanese: `src/content/ja/pages.json`
- Shared schedule: `src/config/schedule.json`
- Shared award list: `src/config/awards.json`
- Public organization settings: `src/config/site.json`

Edit Japanese copy first, then update the matching English page. Keep page keys,
section IDs, paragraph counts, and list-item counts aligned. The validation script
rejects structural differences.

## Claims that require evidence

Do not add a jury, partner, venue, screening, audience, press, history, or prior
winner claim until the private operations record contains an approved source and
the relevant public page has been explicitly authorized.

## Checks

```bash
npm run validate:content
npm run build
```

`npm run build:release` is stricter. It also requires final organization settings,
approved legal text, all four images, and a private-operations attestation.
