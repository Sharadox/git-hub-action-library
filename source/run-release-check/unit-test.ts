import { expect, test, vi } from "vitest";
import { runReleaseCheck } from "@sharadox/git-hub-action-library/run-release-check";

const packageJson = (fields: object) => () => JSON.stringify({ version: "1.0.0", ...fields });

test("passes for a public package tagged on the production branch", () => {
  expect(runReleaseCheck({ TAG: "v1.0.0", ON_PRODUCTION: "true" }, vi.fn(), packageJson({}))).toBe(0);
});

test("fails for a private package, a wrong tag or a tag elsewhere", () => {
  const write = vi.fn();
  expect(runReleaseCheck({ TAG: "v2.0.0", ON_PRODUCTION: "false" }, write, packageJson({ private: true }))).toBe(1);
  expect(write).toHaveBeenCalledTimes(3);
});

test("reads package.json from the working directory by default", () => {
  const write = vi.fn();
  // This repository's own package.json is never tagged "v0.0.0".
  expect(runReleaseCheck({ TAG: "v0.0.0", ON_PRODUCTION: "true" }, write)).toBe(1);
});

test("treats a missing tag as empty", () => {
  const write = vi.fn();
  expect(runReleaseCheck({ ON_PRODUCTION: "true" }, write, packageJson({}))).toBe(1);
  expect(write).toHaveBeenCalledWith("::error::Tag  does not match package.json (v1.0.0).");
});
