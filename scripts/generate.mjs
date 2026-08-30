import { mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import pngToIco from "png-to-ico";
import sharp from "sharp";

import { buildColorMark, buildMonochromeMark } from "../src/geometry.mjs";
import { loadProducts, validateRegistry } from "../src/registry.mjs";
import { buildLockup, buildWordmarkSvg } from "../src/wordmark.mjs";

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

function innerSvg(svg) {
  return svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
}

function surfaceIconSvg(product, size, glyphPercent = 60, rounded = true) {
  const offset = (100 - glyphPercent) / 2;
  const glyph = innerSvg(buildMonochromeMark({ foreground: "#FAFAFA" }));
  const radius = rounded ? Math.round(size * 0.22) : 0;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${product.mark.front}"/><svg x="${offset}%" y="${offset}%" width="${glyphPercent}%" height="${glyphPercent}%" viewBox="0 0 32 32">${glyph}</svg></svg>`,
  );
}

function ogSvg(product) {
  const lockupSource = buildLockup(product, "horizontal");
  const [, lockupViewBox] = lockupSource.match(/viewBox="([^"]+)"/) ?? [];
  const lockup = `<svg x="72" y="176" width="820" height="256" color="#FAFAFA" preserveAspectRatio="xMinYMid meet" viewBox="${lockupViewBox}">${innerSvg(lockupSource)}</svg>`;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#0D0F13"/><rect x="72" y="112" width="96" height="6" rx="3" fill="${product.primary.dark}"/>${lockup}<path d="M72 518H1128" stroke="#3F3F46" stroke-width="2"/><rect x="72" y="548" width="260" height="10" rx="5" fill="#52525B"/><rect x="348" y="548" width="140" height="10" rx="5" fill="${product.primary.dark}"/></svg>`,
  );
}

async function writePng(svg, outputUrl, width, height = width) {
  await sharp(svg, { density: 384 })
    .resize(width, height, { fit: "fill" })
    .png({ compressionLevel: 9, palette: false })
    .toFile(fileURLToPath(outputUrl));
}

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
    "wordmark.svg": buildWordmarkSvg(product.name),
    "lockup-horizontal.svg": buildLockup(product, "horizontal"),
    "lockup-stacked.svg": buildLockup(product, "stacked"),
  };

  await Promise.all(
    Object.entries(files).map(([fileName, contents]) =>
      writeFile(new URL(fileName, productUrl), contents, "utf8"),
    ),
  );

  const faviconSvg = Buffer.from(files["favicon.svg"]);
  for (const size of [16, 32, 48]) {
    await writePng(faviconSvg, new URL(`mark-${size}.png`, productUrl), size);
  }

  await writePng(surfaceIconSvg(product, 180, 68), new URL("apple-touch-icon.png", productUrl), 180);
  await writePng(surfaceIconSvg(product, 192, 68), new URL("pwa-192.png", productUrl), 192);
  await writePng(surfaceIconSvg(product, 512, 68), new URL("pwa-512.png", productUrl), 512);
  await writePng(surfaceIconSvg(product, 192, 60, false), new URL("pwa-maskable-192.png", productUrl), 192);
  await writePng(surfaceIconSvg(product, 512, 60, false), new URL("pwa-maskable-512.png", productUrl), 512);
  await writePng(surfaceIconSvg(product, 512, 64), new URL("avatar-512.png", productUrl), 512);
  await writePng(ogSvg(product), new URL("og-default.png", productUrl), 1200, 630);

  const ico = await pngToIco(
    [16, 32, 48].map((size) => fileURLToPath(new URL(`mark-${size}.png`, productUrl))),
  );
  await writeFile(new URL("favicon.ico", productUrl), ico);

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
