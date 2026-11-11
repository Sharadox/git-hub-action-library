import type { BranchKind, BranchNames } from "@sharadox/git-hub-action-library/branch/type";

/** The Sharadox branch names: `index` is production and `development` integrates features. */
export const DEFAULT_BRANCH_NAMES: BranchNames = { production: "index", integration: "development" };

/** A feature name: one DNS label (lowercase letters, digits and inner hyphens, at most 63 characters). */
const FEATURE_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/**
 * Tells what a branch is in the flow: production, integration, a feature (`<feature>.<integration>`), Dependabot's,
 * or invalid.
 *
 * @example
 * parseBranch("contact-form.development"); // { kind: "feature", feature: "contact-form" }
 */
export function parseBranch(branch: string, names: BranchNames = DEFAULT_BRANCH_NAMES): BranchKind {
  if (branch === names.production) return { kind: "production" };
  if (branch === names.integration) return { kind: "integration" };
  if (branch.startsWith("dependabot/")) return { kind: "dependabot" };
  const suffix = `.${names.integration}`;
  if (branch.endsWith(suffix)) {
    const feature = branch.slice(0, -suffix.length);
    if (FEATURE_LABEL.test(feature)) return { kind: "feature", feature };
  }
  return { kind: "invalid" };
}
