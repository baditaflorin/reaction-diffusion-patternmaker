import { spawn } from "node:child_process";
import { once } from "node:events";
import { chromium } from "playwright";

const port = Number(
  process.env.PORT ?? 4200 + Math.floor(Math.random() * 1000),
);
const baseUrl = `http://127.0.0.1:${port}/reaction-diffusion-patternmaker/`;

const server = spawn(process.execPath, ["scripts/serve-pages.mjs"], {
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});

server.stdout.on("data", (chunk) => process.stdout.write(chunk));
server.stderr.on("data", (chunk) => process.stderr.write(chunk));

async function waitForServer() {
  const deadline = Date.now() + 12_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 180));
    }
  }
  throw new Error(`Timed out waiting for ${baseUrl}`);
}

async function run() {
  await waitForServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1366, height: 900 },
  });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.addInitScript(() => {
    window.localStorage.setItem(
      "reaction-diffusion-patternmaker:settings:v1",
      JSON.stringify({
        presetId: "leopard-spots",
        feed: 0.0367,
        kill: 0.0649,
        diffusionU: 1,
        diffusionV: 0.5,
        timeStep: 1,
        iterationsPerFrame: 1,
        brushRadius: 16,
        resolution: 256,
        palette: "thermal",
        running: true,
        audioEnabled: false,
      }),
    );
  });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page
    .getByRole("heading", { name: "Reaction Diffusion Patternmaker" })
    .waitFor();
  await page.getByRole("button", { name: /Leopard/i }).waitFor();
  await page.getByTitle("Randomize seed").click();

  const canvas = await page
    .getByLabel("Live Gray-Scott reaction diffusion simulation")
    .boundingBox();
  if (!canvas || canvas.width < 200 || canvas.height < 200) {
    throw new Error("Pattern canvas did not render at the expected size");
  }

  const repoHref = await page
    .getByRole("link", { name: /Star/i })
    .getAttribute("href");
  const paypalHref = await page
    .getByRole("link", { name: /PayPal/i })
    .getAttribute("href");
  if (
    repoHref !==
    "https://github.com/baditaflorin/reaction-diffusion-patternmaker"
  ) {
    throw new Error(`Unexpected repo href: ${repoHref}`);
  }
  if (paypalHref !== "https://www.paypal.com/paypalme/florinbadita") {
    throw new Error(`Unexpected PayPal href: ${paypalHref}`);
  }

  await page.getByText(/v0\.1\.0 · commit/).waitFor();
  await page.getByText(/PNG texture/).waitFor();

  if (process.env.UPDATE_SCREENSHOT === "1") {
    await page.screenshot({ path: "docs/screenshot.png", fullPage: true });
  }

  await browser.close();

  if (consoleErrors.length > 0) {
    throw new Error(`Browser console errors:\n${consoleErrors.join("\n")}`);
  }
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    server.kill("SIGTERM");
    await Promise.race([
      once(server, "exit"),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
  });
