import { resolve } from "node:path";

const application = resolve(
  import.meta.dirname,
  "../src-tauri/target/debug/calibar-app",
);

export const config: WebdriverIO.Config = {
  runner: "local",
  specs: ["./smoke.e2e.ts"],
  maxInstances: 1,
  capabilities: [{ browserName: "tauri" }],
  services: [
    ["tauri", { appBinaryPath: application, driverProvider: "embedded" }],
  ],
  framework: "mocha",
  reporters: ["spec"],
  mochaOpts: { timeout: 60_000 },
  logLevel: "warn",
};
