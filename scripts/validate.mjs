import { readdir, readFile } from "node:fs/promises";

import { validateProductColors } from "../src/color.mjs";
import { validateColorLanes } from "../src/color-lanes.mjs";
import { loadProducts, validateRegistry } from "../src/registry.mjs";
import { validateSvg } from "../src/validation.mjs";

const root = new URL("../", import.meta.url);
const distUrl = new URL("dist/", root);
const products = await loadProducts(new URL("products/", root));
const colorLanesSource = await readFile(new URL("color-lanes.json", root), "utf8");
const errors = [...validateRegistry(products), ...validateColorLanes(JSON.parse(colorLanesSource), products)];
if (colorLanesSource !== await readFile(new URL("color-lanes.json", distUrl), "utf8")) errors.push("Generated color-lanes.json differs from its source");
errors.push(...validateSvg("og-family.svg", await readFile(new URL("og-family.svg", distUrl), "utf8")));

for (const product of products) errors.push(...validateProductColors(product));

for (const product of products) {
  const productUrl = new URL(`${product.id}/`, distUrl);
  const fileNames = (await readdir(productUrl)).filter((fileName) => fileName.endsWith(".svg")).sort();
  for (const fileName of fileNames) {
    const svg = await readFile(new URL(fileName, productUrl), "utf8");
    errors.push(...validateSvg(fileName, svg));
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log(`Linq brand assets valid: ${products.length} products`);
}
