import { mkdir, rm, writeFile } from "node:fs/promises";

import { buildColorMark, buildMonochromeMark } from "../src/geometry.mjs";
import { loadProducts, validateRegistry } from "../src/registry.mjs";

const root = new URL("../", import.meta.url);
const productsUrl = new URL("products/", root);
const distUrl = new URL("dist/", root);

const products = await loadProducts(productsUrl);
const registryErrors = validateRegistry(products);
if (registryErrors.length > 0) {
  throw new Error(`Invalid product registry:\n${registryErrors.join("\n")}`);
}

await rm(distUrl, { recursive: true, force: true });
await mkdir(distUrl, { recursive: true });

const registry = [];
const tokenLines = [":root {"];

for (const product of products) {
  const productUrl = new URL(`${product.id}/`, distUrl);
  await mkdir(productUrl, { recursive: true });

  const files = {
    "mark-color.svg": buildColorMark(product),
    "mark-dark.svg": buildColorMark(product, { theme: "dark" }),
    "mark-monochrome.svg": buildMonochromeMark({ foreground: "#09090B" }),
    "mark-reversed.svg": buildMonochromeMark({ foreground: "#FAFAFA" }),
    "favicon.svg": buildColorMark(product, { favicon: true }),
  };

  await Promise.all(
    Object.entries(files).map(([fileName, contents]) =>
      writeFile(new URL(fileName, productUrl), contents, "utf8"),
    ),
  );

  registry.push({
    ...product,
    assets: Object.fromEntries(
      Object.keys(files).map((fileName) => [fileName.replace(/\.svg$/, ""), `./${product.id}/${fileName}`]),
    ),
  });
  tokenLines.push(`  --linq-${product.id}-light: ${product.primary.light};`);
  tokenLines.push(`  --linq-${product.id}-dark: ${product.primary.dark};`);
  tokenLines.push(`  --linq-${product.id}-mark-rear: ${product.mark.rear};`);
  tokenLines.push(`  --linq-${product.id}-mark-front: ${product.mark.front};`);
}

tokenLines.push("}", "");
await writeFile(new URL("index.json", distUrl), `${JSON.stringify(registry, null, 2)}\n`, "utf8");
await writeFile(new URL("tokens.css", distUrl), tokenLines.join("\n"), "utf8");

console.log(`Generated Linq vector assets: ${products.length} products`);
