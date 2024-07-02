import { defineConfig } from "@sand4rt/experimental-ct-web";

export default defineConfig({
  testDir: "src",
  // we should aim to support fully parallel tests
  // however, it is possible that this breaks some tests down the line
  // (if we do not code good, isolated and independent tests)
  fullyParallel: false,
  // we start the vite server so that we can access the public/ directory
  // that contains audio files used in testing
  webServer: {
    command: "pnpm dev --port 3000",
  },
  use: {
    bypassCSP: true,
    ctViteConfig: {
      configFile: "vite.config.ts",
    },
  },
});
