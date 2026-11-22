import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

/** The shared verify action, read as text: each step by its name. */
const action = readFileSync(new URL("../../verify/action.yml", import.meta.url), "utf8");
const step = (name: string) => {
  const start = action.indexOf(`- name: ${name}`);
  const next = action.indexOf("\n    - ", start + 1);
  return action.slice(start, next === -1 ? undefined : next);
};

test("installs only Chromium on the self-hosted runner, whose system libraries are already there", () => {
  const browser = step("Install the browser");
  expect(browser).toContain("runner.environment");
  expect(browser).toMatch(/self-hosted[\s\S]*pnpm exec playwright install chromium/);
  // GitHub's own runners still get the system libraries with the browser.
  expect(browser).toContain("playwright install --with-deps chromium");
});

test("gives the npm token to the install alone, in a settings file it removes afterwards", () => {
  expect(action).not.toContain("registry-url");
  const install = step("Install");
  expect(install).toContain('NODE_AUTH_TOKEN: "${{ inputs.npm-install-token }}"');
  expect(install).toContain("NPM_CONFIG_USERCONFIG");
  expect(install).toMatch(/rm -f "\$settings"/);
  expect(step("Run the checks")).not.toContain("NODE_AUTH_TOKEN");
});
