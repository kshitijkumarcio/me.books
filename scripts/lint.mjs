import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

const args = process.argv.slice(2);

// If user passes --format, translate it to --fix so eslint auto-fixes rules
const formatIndex = args.indexOf("--format");
if (formatIndex !== -1) {
  args.splice(formatIndex, 1, "--fix");
}

const eslintJs = resolve(process.cwd(), "node_modules/eslint/bin/eslint.js");

let result;
if (existsSync(eslintJs)) {
  result = spawnSync(process.execPath, [eslintJs, ...args], {
    stdio: "inherit",
  });
} else {
  result = spawnSync("eslint", args, {
    stdio: "inherit",
    shell: true,
  });
}

process.exit(result.status ?? 0);
