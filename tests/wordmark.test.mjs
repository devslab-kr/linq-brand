import assert from "node:assert/strict";
import test from "node:test";

import { buildLockup, buildWordmark } from "../src/wordmark.mjs";

const products = [
  ["AskLinq", "asklinq", "#14B8A6", "#0F766E"],
  ["BookLinq", "booklinq", "#F59E0B", "#B45309"],
  ["VisionLinq", "visionlinq", "#60A5FA", "#1D4ED8"],
  ["TraceLinq", "tracelinq", "#C084FC", "#7E22CE"],
].map(([name, id, rear, front]) => ({
  name,
  id,
  primary: { light: front, dark: rear },
  mark: { rear, front },
}));

test("outlines every canonical Linq product wordmark", () => {
  for (const product of products) {
    const wordmark = buildWordmark(product.name);
    assert.ok(wordmark.paths.length >= product.name.length - 1);
    assert.ok(wordmark.paths.every(({ d }) => d.startsWith("M")));
    assert.ok(wordmark.width > 0);
    assert.equal(wordmark.capHeight, 710);
  }
});

test("rejects noncanonical product spelling", () => {
  for (const name of ["asklinq", "Ask Linq", "ASKLINQ", "Linq"]) {
    assert.throws(() => buildWordmark(name), new RegExp(`Unknown Linq product wordmark: ${name}`));
  }
});

test("builds path-only horizontal lockups with the approved gap", () => {
  const svg = buildLockup(products[0], "horizontal");

  assert.match(svg, /viewBox="0 0 [0-9.]+ 32"/);
  assert.match(svg, /data-wordmark-start="44"/);
  assert.match(svg, /<path /);
  assert.doesNotMatch(svg, /<text|font-family|AskLinq/);
  assert.doesNotMatch(svg, /fill="[^#c][^"]*"/i);
});

test("builds path-only stacked lockups", () => {
  const svg = buildLockup(products[1], "stacked");

  assert.match(svg, /data-wordmark-start="42"/);
  assert.match(svg, /viewBox="0 0 [0-9.]+ 62"/);
  assert.doesNotMatch(svg, /<text|font-family|BookLinq/);
});

test("rejects unsupported lockup orientation", () => {
  assert.throws(
    () => buildLockup(products[0], "diagonal"),
    /Unsupported lockup orientation: diagonal/,
  );
});
