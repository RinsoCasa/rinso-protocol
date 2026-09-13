import { existsSync, rmSync, mkdirSync, cpSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const include = [
  { src: "index.html", dest: "index.html", type: "file" },
  { src: "css", dest: "css", type: "dir" },
  { src: "js", dest: "js", type: "dir" },
  { src: "assets", dest: "assets", type: "dir" },
];

if (existsSync(dist)) {
  rmSync(dist, { recursive: true, force: true });
}
mkdirSync(dist, { recursive: true });

for (const item of include) {
  const srcPath = path.join(root, item.src);
  const destPath = path.join(dist, item.dest);
  if (!existsSync(srcPath)) {
    throw new Error(`build: expected ${item.src} to exist`);
  }
  if (item.type === "dir") {
    mkdirSync(destPath, { recursive: true });
  }
  cpSync(srcPath, destPath, { recursive: item.type === "dir" });
  console.log(`copied ${item.src} -> dist/${item.dest}`);
}

console.log(`\nbuild complete: ${dist}`);
