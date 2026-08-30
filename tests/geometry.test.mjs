import assert from "node:assert/strict";
import test from "node:test";

import {
  GEOMETRY,
  buildColorMark,
  buildMonochromeMark,
} from "../src/geometry.mjs";

const askLinq = {
  id: "asklinq",
  name: "AskLinq",
  primary: { light: "#0F766E", dark: "#5EEAD4" },
  mark: { rear: "#14B8A6", front: "#0F766E" },
};

test("keeps the restored two-square geometry invariant", () => {
  assert.deepEqual(GEOMETRY, {
    viewBox: "0 0 32 32",
    rear: { x: 5, y: 5, width: 16, height: 16 },
    front: { x: 11, y: 11, width: 16, height: 16 },
    radius: 2,
  });
});

test("paints the product rear square before the dominant front square", () => {
  const svg = buildColorMark(askLinq);
  const rear = '<rect x="5" y="5" width="16" height="16" rx="2" fill="#14B8A6"/>';
  const front = '<rect x="11" y="11" width="16" height="16" rx="2" fill="#0F766E"/>';

  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 32 32">/);
  assert.ok(svg.indexOf(rear) < svg.indexOf(front));
  assert.doesNotMatch(svg, /opacity|<script|foreignObject|(?:href|src)=["']https?:\/\//i);
});

test("uses integer-aligned square corners for the favicon master", () => {
  const svg = buildColorMark(askLinq, { favicon: true });

  assert.match(svg, /<rect x="5" y="5" width="16" height="16" rx="0"/);
  assert.match(svg, /<rect x="11" y="11" width="16" height="16" rx="0"/);
});

test("uses an outline rear square and filled front square in monochrome", () => {
  const svg = buildMonochromeMark({ foreground: "#09090B" });

  assert.match(svg, /<rect x="6" y="6" width="14" height="14" rx="1" fill="none" stroke="#09090B" stroke-width="2"\/>/);
  assert.match(svg, /<rect x="11" y="11" width="16" height="16" rx="2" fill="#09090B"\/>/);
  assert.doesNotMatch(svg, /opacity/);
});
