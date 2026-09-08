import assert from "node:assert/strict";
import test from "node:test";

import { contrastRatio, validateProductColors } from "../src/color.mjs";

const products = [
  ["asklinq", "#0F766E", "#5EEAD4"],
  ["booklinq", "#B45309", "#FBBF24"],
  ["visionlinq", "#1D4ED8", "#8AACF8"],
  ["tracelinq", "#7E22CE", "#D8B4FE"],
  ["gitlinq", "#3F6212", "#BEF264"],
].map(([id, light, dark]) => ({ id, primary: { light, dark } }));

test("approved light anchors meet WCAG AA on white", () => {
  for (const product of products) {
    assert.ok(contrastRatio(product.primary.light, "#FFFFFF") >= 4.5, product.id);
  }
});

test("approved dark anchors meet WCAG AA on the dark brand surface", () => {
  for (const product of products) {
    assert.ok(contrastRatio(product.primary.dark, "#0D0F13") >= 4.5, product.id);
  }
});

test("reports anchors below their declared contrast threshold", () => {
  const product = { id: "lowcontrast", primary: { light: "#777777", dark: "#FFFFFF" } };

  assert.deepEqual(validateProductColors(product), [
    "lowcontrast primary.light contrast 4.48:1 is below 4.5:1 on #FFFFFF",
  ]);
});

test("rejects malformed and alpha colors", () => {
  for (const color of ["#fff", "#FFFFFF80", "white", "transparent"]) {
    assert.throws(() => contrastRatio(color, "#FFFFFF"), /Expected #RRGGBB color/);
  }
});
