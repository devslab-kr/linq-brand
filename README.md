# @devslab/linq-brand

<!-- publisher:start -->
Published by [데브스랩(DevsLab)](https://devslab.kr/).
<!-- publisher:end -->

Official, framework-neutral assets and registry data for the DevsLab Linq Product Family.

| Product | Permanent Color ID | Color family |
| --- | --- | --- |
| AskLinq | P01 | Teal |
| BookLinq | P02 | Amber |
| VisionLinq | P03 | Blue |
| TraceLinq | P04 | Violet |
| [GitLinq](https://devslab.kr/products/gitlinq/) | P05 | Lime |

GitLinq covers version control, selective undo, and team collaboration. Its brand entry is active; the application's release status and supported features are described on its product page.

The [color-lane registry](https://github.com/devslab-kr/linq-brand/blob/v0.2.0/docs/color-registry.md) records all eight permanent single-hue lanes: five active product allocations and three product-free reservations. Reservations are not product assignments or accessibility approval. The [GitLinq allocation record](https://github.com/devslab-kr/linq-brand/blob/v0.2.0/docs/allocations/gitlinq.md) documents its Lime selection, measurements, and recognition limits. At small-size or color-vision limits, review an approved front/rear combination and retain the full product name; eight is a capacity limit, not a color-only recognition guarantee.

```sh
npm install @devslab/linq-brand
```

```js
import products from "@devslab/linq-brand/registry" with { type: "json" };
import colorLanes from "@devslab/linq-brand/color-lanes" with { type: "json" };
```

CSS tokens are available from `@devslab/linq-brand/tokens.css`; static files resolve through `@devslab/linq-brand/assets/<product>/<file>`. Product ZIP downloads are under `assets/downloads/`.

The shared 1200 × 630 product-family image is available as `@devslab/linq-brand/assets/og-family.png`, with an outlined SVG source at `assets/og-family.svg`. It includes every registered product in Color ID order; individual product social images remain in their product directories.

When several product marks appear together, display each complete product name. For a linked logo, use the link's product name as its accessible name; duplicate decorative images use empty alternative text or `aria-hidden="true"`.

Product records in `products/*.json` are the registration source. Keep existing Color IDs and palettes unchanged; retired IDs and colors are never reassigned. Run `npm ci`, `npm run generate`, `npm run validate`, `npm test`, and `npm run pack:check` after updating a record. The generator rebuilds `dist/`, including SVG, PNG, ICO, CSS tokens, registry data, and checksummed product ZIPs. Commit generated assets together with the registration change.

The canonical guidelines are published at <https://devslab.kr/brand/products>. Source code uses the MIT license; artwork follows [BRAND-LICENSE.md](./BRAND-LICENSE.md).

Package releases are available from [npm](https://www.npmjs.com/package/@devslab/linq-brand) and [GitHub Releases](https://github.com/devslab-kr/linq-brand/releases). Issues and source contributions belong in the [Devslab repository](https://github.com/devslab-kr/linq-brand).
