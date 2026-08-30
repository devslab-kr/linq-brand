# @devslab/linq-brand

Official, framework-neutral assets and registry data for the DevsLab Linq Product Family.

```sh
npm install @devslab/linq-brand
```

```js
import products from "@devslab/linq-brand/registry" with { type: "json" };
```

CSS tokens are available from `@devslab/linq-brand/tokens.css`; static files resolve through `@devslab/linq-brand/assets/<product>/<file>`. Product ZIP downloads are under `assets/downloads/`.

When several product marks appear together, display each complete product name. For a linked logo, use the link's product name as its accessible name; duplicate decorative images use empty alternative text or `aria-hidden="true"`.

The canonical guidelines are published at <https://devslab.kr/brand/products>. Source code uses the MIT license; artwork follows [BRAND-LICENSE.md](./BRAND-LICENSE.md).
