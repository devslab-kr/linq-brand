import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";

const npmCommand = process.platform === "win32" ? process.execPath : "npm";
const npmArguments = process.platform === "win32"
  ? [join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js"), "pack", "--dry-run", "--json"]
  : ["pack", "--dry-run", "--json"];
const result = spawnSync(npmCommand, npmArguments, {
  cwd: new URL("../", import.meta.url),
  encoding: "utf8",
});

if (result.status !== 0) {
  process.stderr.write(result.stderr ?? result.error?.message ?? "npm pack failed without diagnostics");
  process.exit(result.status ?? 1);
}

const [report] = JSON.parse(result.stdout);
const names = new Set(report.files.map(({ path }) => path.replaceAll("\\", "/")));
const required = [
  "package.json",
  "README.md",
  "LICENSE",
  "BRAND-LICENSE.md",
  "dist/index.json",
  "dist/tokens.css",
  "dist/downloads/asklinq-brand-assets.zip",
  "dist/downloads/booklinq-brand-assets.zip",
  "dist/downloads/visionlinq-brand-assets.zip",
  "dist/downloads/tracelinq-brand-assets.zip",
];
const forbiddenPrefixes = ["products/", "src/", "scripts/", "tests/", "node_modules/"];
const errors = required.filter((path) => !names.has(path)).map((path) => `Missing package file: ${path}`);
for (const name of names) {
  if (forbiddenPrefixes.some((prefix) => name.startsWith(prefix))) errors.push(`Private source included: ${name}`);
}

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log(`Package archive valid: ${names.size} files`);
}
