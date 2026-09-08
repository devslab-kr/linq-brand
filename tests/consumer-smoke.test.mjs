import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import test from "node:test";

const root = new URL("../", import.meta.url);

function npmInvocation(args, cwd) {
  const npmCommand = process.platform === "win32" ? process.execPath : "npm";
  const npmArguments = process.platform === "win32"
    ? [join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js"), ...args]
    : args;
  return spawnSync(npmCommand, npmArguments, { cwd, encoding: "utf8" });
}

test("a clean framework-free consumer can resolve registry, tokens, and assets", async () => {
  const consumer = await mkdtemp(join(tmpdir(), "linq-brand-consumer-"));

  try {
    const packed = npmInvocation(["pack", "--json", "--pack-destination", consumer], root);
    assert.equal(packed.status, 0, packed.stderr);
    const [{ filename }] = JSON.parse(packed.stdout);

    await writeFile(new URL("package.json", `file:///${consumer.replaceAll("\\", "/")}/`), '{"type":"module"}\n');
    const installed = npmInvocation(
      ["install", join(consumer, filename), "--ignore-scripts", "--no-audit", "--no-fund"],
      consumer,
    );
    assert.equal(installed.status, 0, installed.stderr);

    const smokeScript = `
      import { readFile } from "node:fs/promises";
      import products from "@devslab/linq-brand/registry" with { type: "json" };
      import colorLanes from "@devslab/linq-brand/color-lanes" with { type: "json" };
      const tokens = await readFile(new URL(import.meta.resolve("@devslab/linq-brand/tokens.css")), "utf8");
      const marks = await Promise.all(products.map(async (product) => {
        const svg = new URL(import.meta.resolve("@devslab/linq-brand/assets/" + product.id + "/mark-color.svg"));
        const png = new URL(import.meta.resolve("@devslab/linq-brand/assets/" + product.id + "/mark-32.png"));
        return [(await readFile(svg, "utf8")).startsWith("<svg"), (await readFile(png)).length > 0];
      }));
      console.log(JSON.stringify({ count: products.length, lanes: colorLanes.lanes.length, reserved: colorLanes.lanes.filter(({ status, productId }) => status === "reserved" && productId === null).length, tokens: tokens.includes("--linq-asklinq-light"), marks }));
    `;
    await writeFile(join(consumer, "smoke.mjs"), smokeScript, "utf8");
    const smoke = spawnSync(process.execPath, ["smoke.mjs"], { cwd: consumer, encoding: "utf8" });
    assert.equal(smoke.status, 0, smoke.stderr);
    assert.deepEqual(JSON.parse(smoke.stdout), {
      count: 5,
      lanes: 8,
      reserved: 3,
      tokens: true,
      marks: [[true, true], [true, true], [true, true], [true, true], [true, true]],
    });

    const tree = npmInvocation(["ls", "--all", "--json"], consumer);
    assert.equal(tree.status, 0, tree.stderr);
    const packageNode = JSON.parse(tree.stdout).dependencies["@devslab/linq-brand"];
    assert.deepEqual(packageNode.dependencies ?? {}, {});
  } finally {
    assert.equal(dirname(resolve(consumer)), resolve(tmpdir()));
    assert.ok(basename(consumer).startsWith("linq-brand-consumer-"));
    await rm(consumer, { recursive: true, force: true });
  }
});
