const HEX = /^#[0-9A-Fa-f]{6}$/;

function channels(color) {
  if (!HEX.test(color)) throw new TypeError(`Expected #RRGGBB color, received: ${color}`);
  return [1, 3, 5].map((index) => Number.parseInt(color.slice(index, index + 2), 16) / 255);
}

function linear(channel) {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function luminance(color) {
  const [red, green, blue] = channels(color).map(linear);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(foreground, background) {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

export function validateProductColors(product) {
  const errors = [];
  const roles = [
    ["light", "#FFFFFF"],
    ["dark", "#0D0F13"],
  ];

  for (const [role, background] of roles) {
    const ratio = contrastRatio(product.primary[role], background);
    if (ratio < 4.5) {
      errors.push(
        `${product.id} primary.${role} contrast ${ratio.toFixed(2)}:1 is below 4.5:1 on ${background}`,
      );
    }
  }

  return errors;
}
