import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

import sharp from "sharp";
import { validateSvg } from "../src/validation.mjs";

const dist = new URL("../dist/", import.meta.url);
const products = ["asklinq", "booklinq", "gitlinq", "tracelinq", "visionlinq"];

async function metadata(product, fileName) {
  return sharp(fileURLToPath(new URL(`${product}/${fileName}`, dist))).metadata();
}

test("generates a family social image containing every approved product lockup", async () => {
  const svg = await readFile(new URL("og-family.svg", dist), "utf8");
  assert.deepEqual([...svg.matchAll(/aria-label="([A-Za-z]+Linq)"/g)].map((match) => match[1]), [
    "AskLinq", "BookLinq", "VisionLinq", "TraceLinq", "GitLinq",
  ]);
  assert.doesNotMatch(svg, /<text|font-family/);
  assert.deepEqual(validateSvg("og-family.svg", svg), []);
  const image = await sharp(fileURLToPath(new URL("og-family.png", dist))).metadata();
  assert.equal(image.width, 1200);
  assert.equal(image.height, 630);
});

test("generates exact transparent mark sizes", async () => {
  for (const product of products) {
    for (const size of [16, 32, 48]) {
      const data = await metadata(product, `mark-${size}.png`);
      assert.equal(data.width, size, `${product} width ${size}`);
      assert.equal(data.height, size, `${product} height ${size}`);
      assert.equal(data.hasAlpha, true, `${product} alpha ${size}`);
    }
  }
});

test("generates touch, PWA, avatar, and OG dimensions", async () => {
  const expected = {
    "apple-touch-icon.png": [180, 180],
    "pwa-192.png": [192, 192],
    "pwa-512.png": [512, 512],
    "pwa-maskable-192.png": [192, 192],
    "pwa-maskable-512.png": [512, 512],
    "avatar-512.png": [512, 512],
    "og-default.png": [1200, 630],
  };

  for (const product of products) {
    for (const [fileName, [width, height]] of Object.entries(expected)) {
      const data = await metadata(product, fileName);
      assert.equal(data.width, width, `${product}/${fileName} width`);
      assert.equal(data.height, height, `${product}/${fileName} height`);
    }
  }
});

test("writes a favicon with 16, 32, and 48 pixel frames", async () => {
  for (const product of products) {
    const ico = await readFile(new URL(`${product}/favicon.ico`, dist));
    assert.equal(ico.readUInt16LE(0), 0);
    assert.equal(ico.readUInt16LE(2), 1);
    assert.equal(ico.readUInt16LE(4), 3);
    assert.deepEqual([...ico.subarray(6, 6 + 3 * 16)].filter((_, index) => index % 16 === 0), [16, 32, 48]);
  }
});

test("keeps the maskable glyph inside the central 80 percent safe zone", async () => {
  const { data, info } = await sharp(fileURLToPath(new URL("asklinq/pwa-maskable-512.png", dist)))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const background = [15, 118, 110];
  const xs = [];
  const ys = [];

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * info.channels;
      if (background.some((channel, index) => Math.abs(data[offset + index] - channel) > 3)) {
        xs.push(x);
        ys.push(y);
      }
    }
  }

  assert.ok(Math.min(...xs) >= 51);
  assert.ok(Math.max(...xs) <= 460);
  assert.ok(Math.min(...ys) >= 51);
  assert.ok(Math.max(...ys) <= 460);
});
