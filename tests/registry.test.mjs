import assert from "node:assert/strict";
import test from "node:test";

import { loadProducts, validateRegistry } from "../src/registry.mjs";

test("loads the approved initial Linq product registry", async () => {
  const products = await loadProducts(new URL("../products/", import.meta.url));

  assert.deepEqual(
    products.map(({ id, colorId }) => [id, colorId]),
    [
      ["asklinq", "P01"],
      ["booklinq", "P02"],
      ["tracelinq", "P04"],
      ["visionlinq", "P03"],
    ],
  );
  assert.deepEqual(validateRegistry(products), []);
});

test("rejects duplicate product and color identifiers", () => {
  const duplicate = {
    id: "asklinq",
    name: "AskLinq",
    colorId: "P01",
    status: "active",
    meaning: "conversation, questions, guidance",
    primary: { light: "#0F766E", dark: "#5EEAD4" },
    mark: { rear: "#14B8A6", front: "#0F766E" },
  };

  assert.deepEqual(validateRegistry([duplicate, duplicate]), [
    "Duplicate product id: asklinq",
    "Duplicate color id: P01",
  ]);
});

test("rejects invalid registry fields", () => {
  const errors = validateRegistry([
    {
      id: "Bad Slug",
      name: "Ask Linq",
      colorId: "1",
      status: "draft",
      meaning: "",
      primary: { light: "teal", dark: "#fff" },
      mark: { rear: "#14B8A6", front: "transparent" },
    },
  ]);

  assert.deepEqual(errors, [
    "Invalid product id: Bad Slug",
    "Invalid product name for Bad Slug: Ask Linq",
    "Invalid color id for Bad Slug: 1",
    "Invalid status for Bad Slug: draft",
    "Missing meaning for Bad Slug",
    "Invalid primary.light for Bad Slug: teal",
    "Invalid primary.dark for Bad Slug: #fff",
    "Invalid mark.front for Bad Slug: transparent",
  ]);
});
