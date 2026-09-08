import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { unzipSync, strFromU8 } from "fflate";

const root = new URL("../", import.meta.url);
const dist = new URL("dist/", root);
const products = ["asklinq", "booklinq", "gitlinq", "tracelinq", "visionlinq"];

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

test("publishes verified checksums for every product asset", async () => {
  for (const product of products) {
    const checksums = JSON.parse(await readFile(new URL(`${product}/checksums.json`, dist), "utf8"));
    const names = Object.keys(checksums);
    assert.deepEqual(names, [...names].sort());
    assert.ok(names.includes("mark-color.svg"));
    assert.ok(names.includes("og-default.png"));
    for (const [fileName, expected] of Object.entries(checksums)) {
      assert.match(expected, /^[a-f0-9]{64}$/);
      assert.equal(sha256(await readFile(new URL(`${product}/${fileName}`, dist))), expected);
    }
  }
});

test("creates deterministic product download archives", async () => {
  const downloadChecksums = JSON.parse(await readFile(new URL("downloads/checksums.json", dist), "utf8"));
  for (const product of products) {
    const fileName = `${product}-brand-assets.zip`;
    const archive = await readFile(new URL(`downloads/${fileName}`, dist));
    assert.equal(sha256(archive), downloadChecksums[fileName]);
    const files = unzipSync(archive);
    assert.ok(files["mark-color.svg"]);
    assert.ok(files["favicon.ico"]);
    assert.ok(files["og-default.png"]);
    assert.ok(files["checksums.json"]);
    assert.match(strFromU8(files["README.txt"]), /devslab\.kr\/brand\/products/);
    assert.ok(files["BRAND-LICENSE.md"]);
    assert.equal(JSON.parse(strFromU8(files["manifest.json"])).id, product);
  }
});

test("maps public exports only to package files", async () => {
  const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
  assert.equal(packageJson.private, undefined);
  assert.deepEqual(packageJson.publishConfig, { access: "public" });
  assert.deepEqual(packageJson.files, ["dist", "README.md", "LICENSE", "BRAND-LICENSE.md"]);
  assert.equal(packageJson.exports["./registry"], "./dist/index.json");
  assert.equal(packageJson.exports["./tokens.css"], "./dist/tokens.css");
  assert.equal(packageJson.exports["./assets/*"], "./dist/*");
});

test("checks the package archive without runtime warnings", () => {
  const result = spawnSync(process.execPath, ["scripts/pack-dry-run.mjs"], {
    cwd: new URL("../", import.meta.url),
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /^Package archive valid: \d+ files\s*$/);
});
