import { expect, test, vi } from "vitest";
import { runBranchFlow } from "@sharadox/git-hub-action-library/run-branch-flow";

test("checks the branch and target from the action's environment", () => {
  const write = vi.fn();
  expect(runBranchFlow({ BRANCH: "login.development", TARGET: "index" }, write)).toBe(1);
  expect(write).toHaveBeenCalledWith("::error::Only development merges into index.");
});

test("accepts pushes without a target and custom branch names", () => {
  expect(
    runBranchFlow({ BRANCH: "main", TARGET: "", PRODUCTION_BRANCH: "main", INTEGRATION_BRANCH: "staging" }, vi.fn()),
  ).toBe(0);
});

test("fails clearly when the branch is missing", () => {
  const write = vi.fn();
  expect(runBranchFlow({}, write)).toBe(1);
  expect(write).toHaveBeenCalledWith(
    '::error::Branch "" must be index, development or <feature>.development (lowercase letters, digits and hyphens).',
  );
});
