# Golden Ratio Layout Standard

## Core Ratio

- Major and minor layout regions use `61.8% : 38.2%` as the starting point.
- Text blocks should occupy the major region only when they are the primary
  reading focus. Supporting text and media use the minor region.
- The ratio is a composition rule, not permission to reduce legibility or cause
  text overflow.

## Spacing Scale

Use this rounded golden-ratio sequence for layout spacing:

`8 / 13 / 21 / 34 / 55 / 89px`

- `8px`: icon and inline-label separation
- `13px`: compact control separation
- `21px`: text and control grouping
- `34px`: component separation
- `55px`: section-internal separation
- `89px`: major section separation

Do not introduce arbitrary intermediate spacing unless the responsive layout
requires it.

## Typography And Positioning

- Headings, supporting text, and controls should follow a clear `61.8 / 38.2`
  visual hierarchy.
- Keep text blocks aligned to a shared vertical or horizontal axis.
- Use the spacing scale for heading-to-body and body-to-action relationships.
- On narrow screens, preserve reading order and prevent overflow before
  preserving the exact desktop ratio.

## Responsive Rule

- Desktop: use the full `61.8% : 38.2%` composition where content supports it.
- Tablet: retain the visual hierarchy but allow a single-column transition.
- Mobile: stack content in reading order and use the same spacing sequence.
- Accessibility, minimum touch targets, and readable line length take priority
  over a mathematically exact ratio.
