import { describe, expect, test } from "vitest";
import { checkBranchFlow } from "@sharadox/git-hub-action-library/branch-flow";

describe("checkBranchFlow", () => {
  test.each([
    { branch: "index" },
    { branch: "development" },
    { branch: "login.development" },
    { branch: "login.development", target: "development" },
    { branch: "dependabot/npm_and_yarn/vitest-5.2.0", target: "development" },
    { branch: "development", target: "index" },
  ])("allows $branch into $target", (pull) => {
    expect(checkBranchFlow(pull)).toEqual([]);
  });

  test("rejects branch names outside the flow", () => {
    expect(checkBranchFlow({ branch: "main" })).toEqual([
      'Branch "main" must be index, development or <feature>.development (lowercase letters, digits and hyphens).',
    ]);
  });

  test("only development merges into index", () => {
    expect(checkBranchFlow({ branch: "login.development", target: "index" })).toEqual([
      "Only development merges into index.",
    ]);
  });

  test("only feature branches and Dependabot merge into development", () => {
    expect(checkBranchFlow({ branch: "index", target: "development" })).toEqual([
      "Only <feature>.development branches merge into development.",
    ]);
  });

  test("ignores pull requests into other branches", () => {
    expect(checkBranchFlow({ branch: "login.development", target: "release" })).toEqual([]);
  });

  test("uses the repository's own branch names in its messages", () => {
    const names = { production: "main", integration: "staging" };
    expect(checkBranchFlow({ branch: "x", names })[0]).toContain("main, staging or <feature>.staging");
    expect(checkBranchFlow({ branch: "x.staging", target: "main", names })).toEqual(["Only staging merges into main."]);
  });
});
