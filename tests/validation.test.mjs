import assert from "node:assert/strict";
import test from "node:test";

import { validateSvg } from "../src/validation.mjs";

test("accepts the canonical color mark structure", () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="5" y="5" width="16" height="16" rx="2" fill="#14B8A6"/><rect x="11" y="11" width="16" height="16" rx="2" fill="#0F766E"/></svg>';

  assert.deepEqual(validateSvg("mark-color.svg", svg), []);
});

test("rejects active, remote, embedded, and composited SVG content", () => {
  const unsafe = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" onload="alert(1)"><script/><foreignObject/><image href="https://example.com/a.png"/><image href="data:image/png;base64,AA"/><rect opacity=".5"/></svg>';

  assert.deepEqual(validateSvg("unsafe.svg", unsafe), [
    "unsafe.svg contains forbidden <script>",
    "unsafe.svg contains forbidden <foreignObject>",
    "unsafe.svg contains forbidden <image>",
    "unsafe.svg contains an event handler",
    "unsafe.svg contains an external URL",
    "unsafe.svg contains embedded data",
    "unsafe.svg uses opacity",
  ]);
});

test("rejects geometry drift in standalone mark assets", () => {
  const drifted = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="5" y="5" width="16" height="16"/><rect x="12" y="11" width="16" height="16"/></svg>';

  assert.deepEqual(validateSvg("mark-color.svg", drifted), [
    "mark-color.svg must use viewBox 0 0 32 32",
    "mark-color.svg must contain the front square at 11,11",
  ]);
});
