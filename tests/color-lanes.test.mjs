import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { validateColorLanes } from "../src/color-lanes.mjs";
import { loadProducts } from "../src/registry.mjs";

const approved = JSON.parse(await readFile(new URL("../color-lanes.json", import.meta.url), "utf8"));
const products = await loadProducts(new URL("../products/", import.meta.url));

test("records eight permanent lanes, five allocations, and three product-free reservations", () => {
  assert.deepEqual(approved.lanes.map(({ colorId, status, productId, primary, mark }) => [colorId, status, productId, primary.light, primary.dark, mark.rear, mark.front]), [
    ["P01", "active", "asklinq", "#0F766E", "#5EEAD4", "#14B8A6", "#0F766E"],
    ["P02", "active", "booklinq", "#B45309", "#FBBF24", "#F59E0B", "#B45309"],
    ["P03", "active", "visionlinq", "#1D4ED8", "#8AACF8", "#60A5FA", "#1D4ED8"],
    ["P04", "active", "tracelinq", "#7E22CE", "#D8B4FE", "#C084FC", "#7E22CE"],
    ["P05", "active", "gitlinq", "#3F6212", "#BEF264", "#A3E635", "#3F6212"],
    ["P06", "reserved", null, "#BE123C", "#FDA4AF", "#FB7185", "#BE123C"],
    ["P07", "reserved", null, "#0E7490", "#67E8F9", "#22D3EE", "#0E7490"],
    ["P08", "reserved", null, "#A21CAF", "#F0ABFC", "#E879F9", "#A21CAF"],
  ]);
  assert.deepEqual(validateColorLanes(approved, products), []);
});

test("rejects a ninth lane and an unapproved stage or raised capacity", () => {
  const ninth = structuredClone(approved);
  ninth.lanes.push({ ...ninth.lanes[7], colorId: "P09" });
  assert.ok(validateColorLanes(ninth, products).some((error) => error.includes("at most 8")));
  assert.ok(validateColorLanes({ ...approved, maxSingleHueLanes: 9 }, products).some((error) => error.includes("Unsupported color-lane schema")));
  assert.ok(validateColorLanes({ ...approved, stage: "paired" }, products).some((error) => error.includes("Unsupported color-lane schema")));
});

test("rejects duplicate IDs and cross-lane reuse even when the old lane is retired", () => {
  const duplicate = structuredClone(approved);
  duplicate.lanes[7].colorId = "P07";
  assert.ok(validateColorLanes(duplicate, products).includes("Duplicate lane Color ID: P07"));
  for (const status of ["active", "reserved", "retired"]) {
    const reused = structuredClone(approved);
    reused.lanes[5].status = status;
    reused.lanes[7].mark.rear = reused.lanes[5].primary.light;
    assert.ok(validateColorLanes(reused, products).includes("Color #BE123C belongs to P06; cannot reuse in P08"));
  }
});

test("rejects reserved product assignments and missing, mismatched, or double product allocations", () => {
  const reserved = structuredClone(approved);
  reserved.lanes[5].productId = "gitlinq";
  assert.ok(validateColorLanes(reserved, products).includes("Reserved lane P06 must have productId null"));
  const unassigned = structuredClone(approved);
  unassigned.lanes[4].productId = null;
  assert.ok(validateColorLanes(unassigned, products).includes("Active lane P05 requires a product"));
  const drift = structuredClone(products);
  drift.find(({ id }) => id === "gitlinq").primary.light = "#123456";
  assert.ok(validateColorLanes(approved, drift).includes("Product gitlinq primary.light does not match P05"));
  assert.ok(validateColorLanes(approved, products.filter(({ id }) => id !== "gitlinq")).includes("Lane P05 refers to missing product gitlinq"));
  const doubled = structuredClone(approved);
  doubled.lanes[5].status = "active";
  doubled.lanes[5].productId = "gitlinq";
  assert.ok(validateColorLanes(doubled, products).includes("Product gitlinq is assigned to multiple lanes"));
  assert.ok(validateColorLanes({ ...approved, lanes: approved.lanes.filter(({ colorId }) => colorId !== "P05") }, products).includes("Product gitlinq has no matching P05 allocation"));
});

test("checks reserved anchors as well as active anchors for normal-text contrast", () => {
  const faint = structuredClone(approved);
  faint.lanes[5].primary.light = "#FFFFFF";
  faint.lanes[5].primary.dark = "#0D0F13";
  const errors = validateColorLanes(faint, products);
  assert.ok(errors.some((error) => error.includes("P06 primary.light contrast 1.00:1 is below 4.5:1")));
  assert.ok(errors.some((error) => error.includes("P06 primary.dark contrast 1.00:1 is below 4.5:1")));
});

test("reports malformed lane data without throwing", () => {
  assert.ok(validateColorLanes(null, products).length > 0);
  const malformed = structuredClone(approved);
  malformed.lanes[5] = { colorId: "P06", name: { ko: "", en: "" }, status: "draft", productId: 3, primary: { light: "lime" } };
  const errors = validateColorLanes(malformed, products);
  assert.ok(errors.some((error) => error.includes("Invalid primary.light for lane P06")));
  assert.ok(errors.some((error) => error.includes("Invalid name for lane P06")));
  assert.ok(errors.some((error) => error.includes("Invalid status for lane P06")));
});
