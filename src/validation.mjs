export function validateSvg(fileName, svg) {
  const errors = [];
  const forbiddenElements = ["script", "foreignObject", "image"];

  for (const element of forbiddenElements) {
    if (new RegExp(`<${element}(?:\\s|/|>)`, "i").test(svg)) {
      errors.push(`${fileName} contains forbidden <${element}>`);
    }
  }
  if (/\son[a-z]+\s*=/i.test(svg)) errors.push(`${fileName} contains an event handler`);
  if (/(?:href|src)\s*=\s*["']https?:\/\//i.test(svg)) errors.push(`${fileName} contains an external URL`);
  if (/data:/i.test(svg)) errors.push(`${fileName} contains embedded data`);
  if (/\sopacity\s*=/i.test(svg)) errors.push(`${fileName} uses opacity`);

  if (/^mark-/.test(fileName)) {
    if (!/viewBox="0 0 32 32"/.test(svg)) {
      errors.push(`${fileName} must use viewBox 0 0 32 32`);
    }
    if (!/<rect x="5" y="5" width="16" height="16"/.test(svg) &&
        !/<rect x="6" y="6" width="14" height="14"/.test(svg)) {
      errors.push(`${fileName} must contain the approved rear square`);
    }
    if (!/<rect x="11" y="11" width="16" height="16"/.test(svg)) {
      errors.push(`${fileName} must contain the front square at 11,11`);
    }
  }

  return errors;
}
