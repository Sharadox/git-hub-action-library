import { describe, expect, test } from "vitest";
import { branchDomain } from "@sharadox/git-hub-action-library/branch-domain";

describe("branchDomain", () => {
  test.each([
    ["index", "sharadox.com", "sharadox.com"],
    ["development", "sharadox.com", "development.sharadox.com"],
    ["login.development", "sharadox.com", "login.development.sharadox.com"],
    ["index", "platform.sharadox.com", "platform.sharadox.com"],
    ["login.development", "platform.sharadox.com", "login.development.platform.sharadox.com"],
  ])("%s on %s is %s", (branch, base, expected) => {
    expect(branchDomain(branch, base)).toBe(expected);
  });

  test.each(["dependabot/npm_and_yarn/x", "main"])("%s has no domain", (branch) => {
    expect(branchDomain(branch, "sharadox.com")).toBeUndefined();
  });
});
