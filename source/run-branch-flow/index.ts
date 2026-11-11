import { reportErrors } from "@sharadox/git-hub-action-library/action-output";
import type { Write } from "@sharadox/git-hub-action-library/action-output/type";
import { checkBranchFlow } from "@sharadox/git-hub-action-library/branch-flow";
import { DEFAULT_BRANCH_NAMES } from "@sharadox/git-hub-action-library/branch";
import type { Environment } from "@sharadox/git-hub-action-library/action-output/type";

/**
 * The branch-flow action: reads `BRANCH`, `TARGET` (empty on pushes), `PRODUCTION_BRANCH` and `INTEGRATION_BRANCH`
 * and reports any problem. Returns the exit code.
 */
export function runBranchFlow(environment: Environment, write: Write): number {
  const names = {
    production: environment.PRODUCTION_BRANCH || DEFAULT_BRANCH_NAMES.production,
    integration: environment.INTEGRATION_BRANCH || DEFAULT_BRANCH_NAMES.integration,
  };
  return reportErrors(
    checkBranchFlow({ branch: environment.BRANCH ?? "", target: environment.TARGET || undefined, names }),
    write,
  );
}
