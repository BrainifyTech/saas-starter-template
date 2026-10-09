import { defineConfig, devices } from "@playwright/test";

// The browser suite. Two ways to run it:
//
// - Locally or in CI, with nothing running: Playwright starts `npm run dev`
//   on PORT (3000) and drives it. It needs DATABASE_URL like the app does.
// - Against a product that is already up (a preview, RapidBuild's browser
//   runner): set E2E_BASE_URL and no server is started.
//
// The suite is evidence about the running product, not a gate on a commit.
const port = Number(process.env.PORT ?? 3000);
const external = process.env.E2E_BASE_URL;
const baseURL = external ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: external
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        // The first `next dev` compile of a page is slow on a cold machine.
        timeout: 180_000,
      },
});
