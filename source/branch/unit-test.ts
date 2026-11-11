import { describe, expect, test } from "vitest";
import { DEFAULT_BRANCH_NAMES, parseBranch } from "@sharadox/git-hub-action-library/branch";

describe("parseBranch", () => {
  test.each([
    ["index", { kind: "production" }],
    ["development", { kind: "integration" }],
    ["contact-form.development", { kind: "feature", feature: "contact-form" }],
    ["a.development", { kind: "feature", feature: "a" }],
    ["dependabot/npm_and_yarn/next-16.5.0", { kind: "dependabot" }],
  ] as const)("%s", (branch, expected) => {
    expect(parseBranch(branch)).toEqual(expected);
  });

  test.each([
    "main",
    "preview",
    "Feature.development",
    "-start.development",
    "end-.development",
    ".development",
    `${"a".repeat(64)}.development`,
    "x.preview",
  ])("rejects %s", (branch) => {
    expect(parseBranch(branch)).toEqual({ kind: "invalid" });
  });

  test("accepts a 63-character feature label, the longest DNS label", () => {
    expect(parseBranch(`${"a".repeat(63)}.development`).kind).toBe("feature");
  });

  test("follows other branch names when a repository uses them", () => {
    const names = { production: "main", integration: "staging" };
    expect(parseBranch("main", names)).toEqual({ kind: "production" });
    expect(parseBranch("staging", names)).toEqual({ kind: "integration" });
    expect(parseBranch("login.staging", names)).toEqual({ kind: "feature", feature: "login" });
    expect(parseBranch("index", names)).toEqual({ kind: "invalid" });
  });

  test("defaults to index and development", () => {
    expect(DEFAULT_BRANCH_NAMES).toEqual({ production: "index", integration: "development" });
  });
});
