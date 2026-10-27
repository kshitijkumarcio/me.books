import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);

// If user passes --format, translate it to --fix so eslint auto-fixes rules (including removing unused imports)
const formatIndex = args.indexOf("--format");
if (formatIndex !== -1) {
  args.splice(formatIndex, 1, "--fix");
}

const result = spawnSync("eslint", args, {
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 0);
