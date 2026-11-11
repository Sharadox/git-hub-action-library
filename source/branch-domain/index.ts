import { DEFAULT_BRANCH_NAMES, parseBranch } from "@sharadox/git-hub-action-library/branch";
import type { BranchNames } from "@sharadox/git-hub-action-library/branch/type";

/**
 * The address a branch is served on: the branch name is the subdomain of the repository's base domain. Production
 * is the base domain itself; Dependabot's and invalid branches have none.
 *
 * @example
 * branchDomain("login.development", "platform.sharadox.com"); // "login.development.platform.sharadox.com"
 */
export function branchDomain(
  branch: string,
  baseDomain: string,
  names: BranchNames = DEFAULT_BRANCH_NAMES,
): string | undefined {
  const parsed = parseBranch(branch, names);
  if (parsed.kind === "production") return baseDomain;
  if (parsed.kind === "integration" || parsed.kind === "feature") return `${branch}.${baseDomain}`;
  return undefined;
}
