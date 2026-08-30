import { readdir, readFile } from "node:fs/promises";

const HEX = /^#[0-9A-F]{6}$/;
const PRODUCT_ID = /^[a-z][a-z0-9]*$/;
const COLOR_ID = /^P\d{2}$/;
const STATUSES = new Set(["reserved", "active", "retired"]);

export async function loadProducts(directoryUrl) {
  const fileNames = (await readdir(directoryUrl))
    .filter((fileName) => fileName.endsWith(".json"))
    .sort();

  return Promise.all(
    fileNames.map(async (fileName) =>
      JSON.parse(await readFile(new URL(fileName, directoryUrl), "utf8")),
    ),
  );
}

export function validateRegistry(products) {
  const errors = [];
  const productIds = new Set();
  const colorIds = new Set();

  for (const product of products) {
    const id = product?.id ?? "<missing>";

    if (productIds.has(id)) errors.push(`Duplicate product id: ${id}`);
    productIds.add(id);
    if (colorIds.has(product?.colorId)) errors.push(`Duplicate color id: ${product?.colorId}`);
    colorIds.add(product?.colorId);

    if (!PRODUCT_ID.test(id)) errors.push(`Invalid product id: ${id}`);
    if (!/^[A-Z][A-Za-z0-9]*Linq$/.test(product?.name ?? "")) {
      errors.push(`Invalid product name for ${id}: ${product?.name ?? "<missing>"}`);
    }
    if (!COLOR_ID.test(product?.colorId ?? "")) {
      errors.push(`Invalid color id for ${id}: ${product?.colorId ?? "<missing>"}`);
    }
    if (!STATUSES.has(product?.status)) {
      errors.push(`Invalid status for ${id}: ${product?.status ?? "<missing>"}`);
    }
    if (typeof product?.meaning !== "string" || product.meaning.trim() === "") {
      errors.push(`Missing meaning for ${id}`);
    }

    for (const [group, keys] of Object.entries({ primary: ["light", "dark"], mark: ["rear", "front"] })) {
      for (const key of keys) {
        const value = product?.[group]?.[key];
        if (!HEX.test(value ?? "")) {
          errors.push(`Invalid ${group}.${key} for ${id}: ${value ?? "<missing>"}`);
        }
      }
    }
  }

  return errors;
}
