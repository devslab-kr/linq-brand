import { readdir, readFile } from "node:fs/promises";

import { validateProductColors } from "../src/color.mjs";
import { loadProducts, validateRegistry } from "../src/registry.mjs";
import { validateSvg } from "../src/validation.mjs";

const root = new URL("../", import.meta.url);
const distUrl = new URL("dist/", root);
const products = await loadProducts(new URL("products/", root));
const errors = [...validateRegistry(products)];

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
