import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

/** The shared prerelease cleanup action, read as text. */
const action = readFileSync(new URL("../../prerelease-cleanup/action.yml", import.meta.url), "utf8");

test("removes the tag with npm Trusted Publishing when no token is given", () => {
  expect(action).not.toContain("required: true");
  expect(action).toMatch(/npm-token:[\s\S]*default: ""/);
  // Removing a dist-tag through Trusted Publishing needs npm 11.21 or later.
  expect(action).toMatch(/npm install --global npm@11\.(2[1-9]|[3-9]\d)\.\d+[\s\S]*npm dist-tag rm/);
});
