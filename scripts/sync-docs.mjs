import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "out");
const docsDir = join(root, "docs");

console.log("Building Next.js static export…");
execSync("npm run build", { cwd: root, stdio: "inherit" });

if (!existsSync(outDir)) {
  throw new Error("Build did not produce out/ directory");
}

console.log("Syncing out/ -> docs/…");
if (existsSync(docsDir)) {
  for (const entry of readdirSync(docsDir)) {
    rmSync(join(docsDir, entry), { recursive: true, force: true });
  }
} else {
  mkdirSync(docsDir, { recursive: true });
}

cpSync(outDir, docsDir, { recursive: true });
writeFileSync(join(docsDir, "CNAME"), "handshakealerts.com\n");
writeFileSync(join(docsDir, ".nojekyll"), "");
console.log("Done. docs/ is ready for GitHub Pages.");
