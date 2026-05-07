import { rmSync } from "node:fs";

for (const path of [
  "../docs/assets",
  "../docs/index.html",
  "../docs/404.html",
  "../docs/icon.svg",
  "../docs/manifest.webmanifest",
  "../docs/sw.js",
]) {
  rmSync(new URL(path, import.meta.url), { force: true, recursive: true });
}
