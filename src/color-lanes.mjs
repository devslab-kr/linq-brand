import { validateProductColors } from "./color.mjs";

const HEX = /^#[0-9A-F]{6}$/;
const ROLES = { primary: ["light", "dark"], mark: ["rear", "front"] };

export function validateColorLanes(registry, products) {
  const errors = [];
  if (registry?.schemaVersion !== 1 || registry?.stage !== "single-hue" || registry?.maxSingleHueLanes !== 8 || !Array.isArray(registry?.lanes)) {
    return ["Unsupported color-lane schema; single-hue version 1 has capacity 8"];
  }
  if (registry.lanes.length > 8) errors.push("Single-hue registry supports at most 8 lanes; an approved paired-signature extension is required");
  const ids = new Set();
  const owners = new Map();
  const assigned = new Set();

  for (const lane of registry.lanes) {
    const id = lane?.colorId ?? "<missing>";
    if (!/^P\d{2}$/.test(id)) errors.push(`Invalid lane Color ID: ${id}`);
    if (ids.has(id)) errors.push(`Duplicate lane Color ID: ${id}`);
    ids.add(id);
    if (!["ko", "en"].every((key) => typeof lane?.name?.[key] === "string" && lane.name[key].trim())) errors.push(`Invalid name for lane ${id}`);
    if (!["active", "reserved", "retired"].includes(lane?.status)) errors.push(`Invalid status for lane ${id}`);
    if (lane?.productId !== null && (typeof lane?.productId !== "string" || !/^[a-z][a-z0-9]*$/.test(lane.productId))) errors.push(`Invalid productId for lane ${id}`);
    if (lane?.status === "reserved" && lane.productId !== null) errors.push(`Reserved lane ${id} must have productId null`);
    if (lane?.status === "active" && !lane.productId) errors.push(`Active lane ${id} requires a product`);

    let validColors = true;
    for (const [group, keys] of Object.entries(ROLES)) {
      for (const key of keys) {
        const color = lane?.[group]?.[key];
        if (!HEX.test(color ?? "")) {
          errors.push(`Invalid ${group}.${key} for lane ${id}`);
          validColors = false;
          continue;
        }
        // The light anchor and front face may coincide inside one lane.
        // Reserved and retired lanes retain ownership just like active lanes.
        if (owners.has(color) && owners.get(color) !== id) errors.push(`Color ${color} belongs to ${owners.get(color)}; cannot reuse in ${id}`);
        else owners.set(color, id);
      }
    }
    if (validColors) errors.push(...validateProductColors({ ...lane, id }));

    if (typeof lane?.productId === "string") {
      if (assigned.has(lane.productId)) errors.push(`Product ${lane.productId} is assigned to multiple lanes`);
      assigned.add(lane.productId);
      const product = products.find(({ id: productId }) => productId === lane.productId);
      if (!product) errors.push(`Lane ${id} refers to missing product ${lane.productId}`);
      else {
        if (product.colorId !== id || product.status !== lane.status) errors.push(`Product ${product.id} allocation does not match lane ${id}`);
        for (const [group, keys] of Object.entries(ROLES)) {
          for (const key of keys) {
            if (product[group]?.[key] !== lane[group]?.[key]) errors.push(`Product ${product.id} ${group}.${key} does not match ${id}`);
          }
        }
      }
    }
  }
  for (const product of products) {
    if (!registry.lanes.some((lane) => lane?.colorId === product.colorId && lane.productId === product.id && lane.status !== "reserved")) errors.push(`Product ${product.id} has no matching ${product.colorId} allocation`);
  }
  return errors;
}
