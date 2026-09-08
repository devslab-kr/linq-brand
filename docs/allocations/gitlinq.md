# GitLinq — P05 Lime allocation

Package version: **0.2.0**. Status: **active product allocation**.

GitLinq is a Windows Git client for people familiar with SVN. Its product
identity concerns everyday version control, selective undo and team work.
P05 uses one Lime family, with the canonical two-square geometry:

| Role | Anchor | Text contrast in the declared reference context |
| --- | --- | --- |
| Light UI and front face | #3F6212 | 7.078:1 on white |
| Dark UI | #BEF264 | 14.682:1 on #0D0F13 |
| Rear face | #A3E635 | Logo face; not an automatic text token |

The dark mark uses the same family with the established dark-theme recipe.
Existing AskLinq P01, BookLinq P02, VisionLinq P03 and TraceLinq P04 allocations
retain their anchors and geometry. P06 Rose, P07 Cyan and P08 Magenta are
predefined reservations, not additional products.

## Comparison and choice

Five candidates were compared against the four existing palettes using Color.js
0.7.1, OKLab/OKLCH coordinates, CIEDE2000 and reference-surface contrast.
Lime had the largest minimum CIEDE2000 distance to the existing palettes in
this set's same-role comparisons: 24.040 (light), 27.535 (dark), and 32.080 (rear).
This is not a universal optimum: Rose's minimum light-role OKLab distance was
slightly larger. No new numeric acceptance threshold was invented.

Rose was close to GitLinq's deletion/error foreground (Delta E 2000: 6.805),
Orange was close to BookLinq, and Magenta was close to TraceLinq. Cyan remained
close to AskLinq, particularly in tritanopia. Lime gives GitLinq a separate
yellow-green identity within the normal product-family presentation.
No inherent association between Lime and successful Git operations is claimed.

Evidence: [measurements](../evidence/color-candidates.json),
[normal](../evidence/normal.png), [grayscale](../evidence/grayscale.png),
[protanopia](../evidence/protanopia.png),
[deuteranopia](../evidence/deuteranopia.png),
[tritanopia](../evidence/tritanopia.png).
Screenshots show the comparison candidates before selection, including the
discarded Orange candidate; they are not eight approved standalone identities.

## Required application and review limits

- Use Lime for the product mark and product identity on the company homepage,
  introduction, manual and brand page. Show the full name GitLinq beside it.
- Preserve the actual application's error/deletion #A94444, addition/retained
  #287046, caution #98600C and action/information #2455C5 roles. Lime is near
  the addition/retained foreground (Delta E 2000: 12.601), so it must not be
  substituted for a success or addition state. The website's app illustration
  keeps its blue action/selection colors separately from the Lime identity.
- In protanopia/deuteranopia, Lime can resemble BookLinq's Amber. At 16px in
  grayscale, isolated identical marks do not guarantee unique identity. The
  existing four products share this limitation. Simulation does not measure
  human recognition performance or establish a user-study pass.
- Review 16px geometry and complete-name identification in the actual context.
  The [registry clarification](../color-registry.md#accessibility-and-the-v020-clarification)
  explicitly replaces the impossible reading of color-only grayscale uniqueness;
  this allocation does not claim every original isolated-icon gate passed.
- Maintain light/dark readable text, keyboard focus, narrow layouts and separate
  semantic labels. Pairing is a future approved extension if single-hue identity
  reaches its usable limit; it is not implemented by this allocation.

This release updates brand assets and website presentation. It does not change
the GitLinq application version or promise unimplemented application features.
