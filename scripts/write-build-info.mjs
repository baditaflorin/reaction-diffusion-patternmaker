import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

const info = {
  version: process.env.VITE_APP_VERSION ?? pkg.version,
  sourceCommit: process.env.VITE_SOURCE_COMMIT ?? "runtime",
  builtAt: process.env.VITE_BUILT_AT ?? "static",
  repoUrl: "https://github.com/baditaflorin/reaction-diffusion-patternmaker",
  paypalUrl: "https://www.paypal.com/paypalme/florinbadita",
  liveUrl: "https://baditaflorin.github.io/reaction-diffusion-patternmaker/",
};

mkdirSync(new URL("../src/generated", import.meta.url), { recursive: true });
writeFileSync(
  new URL("../src/generated/buildInfo.ts", import.meta.url),
  `export const buildInfo = ${JSON.stringify(info, null, 2)} as const;\n`,
);
