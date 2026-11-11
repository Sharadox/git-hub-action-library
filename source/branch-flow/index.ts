import { DEFAULT_BRANCH_NAMES, parseBranch } from "@sharadox/git-hub-action-library/branch";
import type { BranchFlowCheck } from "@sharadox/git-hub-action-library/branch-flow/type";

/**
 * Checks a branch against the flow: every branch is production, integration, `<feature>.<integration>` or
 * Dependabot's; only integration merges into production; only features and Dependabot merge into integration.
 * Returns the problems found (empty when the flow is respected).
 *
 * @example
 * checkBranchFlow({ branch: "login.development", target: "index" }); // ["Only development merges into index."]
 */
export function checkBranchFlow({ branch, target, names = DEFAULT_BRANCH_NAMES }: BranchFlowCheck): string[] {
  const { production, integration } = names;
  const parsed = parseBranch(branch, names);
  if (parsed.kind === "invalid") {
    return [
      `Branch "${branch}" must be ${production}, ${integration} or <feature>.${integration} (lowercase letters, digits and hyphens).`,
    ];
  }
  if (target === production && parsed.kind !== "integration") return [`Only ${integration} merges into ${production}.`];
  if (target === integration && parsed.kind !== "feature" && parsed.kind !== "dependabot") {
    return [`Only <feature>.${integration} branches merge into ${integration}.`];
  }
  return [];
}
