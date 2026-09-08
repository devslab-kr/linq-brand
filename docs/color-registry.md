# Linq color registry

The central registry defines eight single-hue color lanes before the remaining
products are named. Product teams select a suitable reservation through the
allocation process; they do not invent an independent palette.

`color-lanes.json` is the source for the full table. `products/*.json` contains
actual product allocations only. Both are validated together and exported in
the package; reserved lanes do not generate product assets or downloads.

| Permanent ID | Color family | Allocation | Light UI / front | Dark UI | Rear face |
| --- | --- | --- | --- | --- | --- |
| P01 | Teal | AskLinq | #0F766E | #5EEAD4 | #14B8A6 |
| P02 | Amber | BookLinq | #B45309 | #FBBF24 | #F59E0B |
| P03 | Blue | VisionLinq | #1D4ED8 | #8AACF8 | #60A5FA |
| P04 | Violet | TraceLinq | #7E22CE | #D8B4FE | #C084FC |
| P05 | Lime | GitLinq | #3F6212 | #BEF264 | #A3E635 |
| P06 | Rose | Reserved; no product | #BE123C | #FDA4AF | #FB7185 |
| P07 | Cyan | Reserved; no product | #0E7490 | #67E8F9 | #22D3EE |
| P08 | Magenta | Reserved; no product | #A21CAF | #F0ABFC | #E879F9 |

The first four allocations are unchanged. P05–P08 are the four newly designated
families in v0.2.0; P05 is assigned to GitLinq in the same release.

## Allocation and expansion

1. Start with the predefined single-hue lanes, up to eight. A reservation fixes
   a palette for consideration; it does not approve that palette in an unknown
   product's actual UI. Color IDs are permanent identifiers, not a name hash or
   a launch-order algorithm.
2. Review product meaning, distances from existing products, light/dark contrast,
   small-size use, color-vision simulations and semantic status colors. Numeric
   color distances inform review and are not automatic approval thresholds.
3. When single hues reach their reliable distinction limit, an approved paired
   signature may keep the primary UI hue on the front square and use a secondary
   hue behind it. Eight is a ceiling, not a guarantee that all eight are suitable
   in every context. The current generator supports the single-hue stage; a
   paired signature requires an explicit registry and generator extension.
4. Never reassign a retired ID or color to a different product. Retired records
   remain in the registry. Published anchors and the four established product
   identities must not be silently changed or removed to free capacity.

The fixed two-square geometry and full product name remain the recognition
system. Do not add product initials, rotations or ad-hoc shape changes. In
multi-product navigation and comparisons, show a visible complete product
name; a tooltip is insufficient. Keep the corporate DevsLab mark separate.

## Accessibility and the v0.2.0 clarification

The original design required 16px distinction in normal vision, grayscale and
common color-vision simulations, while separately prohibiting color-only
identification. Review showed that identical monochrome geometry cannot carry
unique product identity through color alone, including for the existing four
products. A two-color signature also cannot guarantee that in every environment.

For v0.2.0, the operational review is explicitly **16px shape legibility plus
identification in the actual context with complete visible product names**.
This is a clarification of the earlier literal color-only gate, not a claim
that every isolated icon passed it. The visual limits remain in the allocation
record. Compact icon-only navigation must not ask users to distinguish products
solely by color.

Declared text and control roles still require WCAG 2.2 AA: 4.5:1 for ordinary
text, 3:1 for large text and relevant component boundaries, and visible focus.
The current numeric validation covers light text anchors on white and dark text
anchors on #0D0F13; actual UI roles require their own context review.
Product identity colors must not automatically replace error, warning, success
or information tokens. Visible status text and appropriate icons retain meaning.

P07 Cyan can resemble P01 Teal in tritanopia; P08 Magenta is close to P04 Violet
and can resemble blue/violet products in other simulations. P05 Lime can resemble
P02 Amber in protanopia/deuteranopia. These reservations do not certify universal
color-only distinction. See the [GitLinq allocation](allocations/gitlinq.md) and
its evidence before making another product allocation.

## Consuming the registry

```js
import products from '@devslab/linq-brand/registry' with { type: 'json' };
import colorLanes from '@devslab/linq-brand/color-lanes' with { type: 'json' };
```

Public guidelines: https://devslab.kr/brand/products/
