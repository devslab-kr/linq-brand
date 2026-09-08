import { fileURLToPath } from "node:url";

import { openSync } from "fontkit";

const FONT_URL = new URL(
  "../node_modules/@fontsource/geist/files/geist-latin-600-normal.woff2",
  import.meta.url,
);
const FONT = openSync(fileURLToPath(FONT_URL));
const CANONICAL_NAMES = new Set(["AskLinq", "BookLinq", "VisionLinq", "TraceLinq", "GitLinq"]);
const TRACKING = -25;
const DISPLAY_CAP_HEIGHT = 20;

function number(value) {
  return Number(value.toFixed(3));
}

export function buildWordmark(name) {
  if (!CANONICAL_NAMES.has(name)) {
    throw new Error(`Unknown Linq product wordmark: ${name}`);
  }

  const run = FONT.layout(name);
  let cursor = 0;
  const paths = run.glyphs.map((glyph, index) => {
    const position = run.positions[index];
    const item = {
      d: glyph.path.toSVG(),
      x: cursor + position.xOffset,
      y: position.yOffset,
    };
    cursor += position.xAdvance + (index === run.glyphs.length - 1 ? 0 : TRACKING);
    return item;
  });

  return {
    paths,
    width: cursor,
    height: FONT.capHeight,
    capHeight: FONT.capHeight,
    unitsPerEm: FONT.unitsPerEm,
  };
}

function renderPaths(wordmark, { x, y, scale }) {
  return wordmark.paths
    .map(({ d, x: glyphX, y: glyphY }) => {
      const tx = number(x + glyphX * scale);
      const ty = number(y + DISPLAY_CAP_HEIGHT + glyphY * scale);
      return `<path d="${d}" transform="translate(${tx} ${ty}) scale(${number(scale)} ${number(-scale)})" fill="currentColor"/>`;
    })
    .join("");
}

function markRects(product, x = 0, y = 0) {
  return `<g transform="translate(${number(x)} ${number(y)})"><rect x="5" y="5" width="16" height="16" rx="2" fill="${product.mark.rear}"/><rect x="11" y="11" width="16" height="16" rx="2" fill="${product.mark.front}"/></g>`;
}

export function buildWordmarkSvg(name) {
  const wordmark = buildWordmark(name);
  const scale = DISPLAY_CAP_HEIGHT / wordmark.capHeight;
  const width = number(wordmark.width * scale);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${DISPLAY_CAP_HEIGHT}">${renderPaths(wordmark, { x: 0, y: 0, scale })}</svg>\n`;
}

export function buildLockup(product, orientation = "horizontal") {
  const wordmark = buildWordmark(product.name);
  const scale = DISPLAY_CAP_HEIGHT / wordmark.capHeight;
  const wordmarkWidth = number(wordmark.width * scale);

  if (orientation === "horizontal") {
    const wordmarkX = 44;
    const wordmarkY = 6;
    const width = number(wordmarkX + wordmarkWidth);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 32" data-wordmark-start="44">${markRects(product)}${renderPaths(wordmark, { x: wordmarkX, y: wordmarkY, scale })}</svg>\n`;
  }

  if (orientation === "stacked") {
    const width = number(Math.max(32, wordmarkWidth));
    const markX = number((width - 32) / 2);
    const wordmarkX = number((width - wordmarkWidth) / 2);
    const wordmarkY = 42;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 62" data-wordmark-start="42">${markRects(product, markX)}${renderPaths(wordmark, { x: wordmarkX, y: wordmarkY, scale })}</svg>\n`;
  }

  throw new Error(`Unsupported lockup orientation: ${orientation}`);
}
