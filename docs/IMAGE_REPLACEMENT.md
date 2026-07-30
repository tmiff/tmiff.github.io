# Image Replacement Procedure

Six generated image slots are defined in `src/config/image-slots.json`.

The same record also controls browser presentation without modifying the source
image:

- `display.position`: desktop focal point
- `display.mobilePosition`: mobile focal point
- `display.scale`: desktop crop zoom (`1` means no zoom)
- `display.mobileScale`: mobile crop zoom

The brand logo uses four separate assets:

- `public/images/brand/tmiff-logo-source.png`: untouched official source image
- `public/images/brand/tmiff-logo-transparent.png`: tightly cropped transparent
  combined derivative
- `public/images/brand/tmiff-mark-transparent.png`: `TMIFF` abbreviation only;
  this is the header asset
- `public/images/brand/tmiff-name-transparent.png`: full festival name only

Replace the source file first, then run `npm run generate:logos`. The script
separates the two rows and recreates all three transparent derivatives from the
official source rather than redrawing or regenerating its letterforms.

For each image, complete these steps in order:

1. Review the slot purpose, dimensions, ratio, safe crop, alt text, prompt, and rights fields.
2. Generate one image only.
3. Confirm the exact pixel dimensions and inspect the full image without browser cropping.
4. Convert the approved master to WebP without changing the required dimensions.
5. Place it at the path in the slot's `file` field.
6. Check desktop and mobile layouts.
7. Record the source, set `rightsStatus` to `generated-original`, and set `approvalStatus` to `approved` only after human approval.
8. Run `npm run validate:content` and `npm run build`.

Do not depict a fictional past festival, audience, jury, winner, or venue as if it
were documentary evidence. Winner pages use applicant-provided stills only after
publication permission is recorded.
