export const GEOMETRY = Object.freeze({
  viewBox: "0 0 32 32",
  rear: Object.freeze({ x: 5, y: 5, width: 16, height: 16 }),
  front: Object.freeze({ x: 11, y: 11, width: 16, height: 16 }),
  radius: 2,
});

function rect({ x, y, width, height }, attributes) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" ${attributes}/>`;
}

function svg(children) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${GEOMETRY.viewBox}">${children}</svg>\n`;
}

export function buildColorMark(product, options = {}) {
  const radius = options.favicon ? 0 : GEOMETRY.radius;
  const rear = options.theme === "dark" ? product.primary.dark : product.mark.rear;
  const front = options.theme === "dark" ? product.mark.rear : product.mark.front;

  return svg(
    rect(GEOMETRY.rear, `rx="${radius}" fill="${rear}"`) +
      rect(GEOMETRY.front, `rx="${radius}" fill="${front}"`),
  );
}

export function buildMonochromeMark(options = {}) {
  const foreground = options.foreground ?? "#09090B";
  const rear = { x: 6, y: 6, width: 14, height: 14 };

  return svg(
    rect(rear, `rx="1" fill="none" stroke="${foreground}" stroke-width="2"`) +
      rect(GEOMETRY.front, `rx="${GEOMETRY.radius}" fill="${foreground}"`),
  );
}
