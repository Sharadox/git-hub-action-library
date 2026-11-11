import { reportErrors, reportNotice } from "@sharadox/git-hub-action-library/action-output";
import type { Write } from "@sharadox/git-hub-action-library/action-output/type";
import { DEFAULT_BRANCH_NAMES, parseBranch } from "@sharadox/git-hub-action-library/branch";
import { branchDomain } from "@sharadox/git-hub-action-library/branch-domain";
import type { Environment } from "@sharadox/git-hub-action-library/action-output/type";
import { updateBranchDomain } from "@sharadox/git-hub-action-library/vercel-domain";
import type { Fetch } from "@sharadox/git-hub-action-library/vercel-domain/type";

/**
 * The branch-domain action: when a `<feature>.<integration>` branch is created or deleted, adds or removes
 * `<feature>.<integration>.<BASE_DOMAIN>` on the Vercel project. Deployments are kept (Vercel expires them). Repositories without a base domain are skipped.
 * Reads `EVENT`, `BRANCH`, `BASE_DOMAIN`, `INTEGRATION_BRANCH`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID` and
 * `VERCEL_TOKEN`. Returns the exit code.
 */
export async function runBranchDomain(environment: Environment, write: Write, fetch?: Fetch): Promise<number> {
  const branch = environment.BRANCH ?? "";
  const baseDomain = environment.BASE_DOMAIN ?? "";
  if (!baseDomain) {
    write("No base domain: this repository's branches stay on Vercel's own addresses.");
    return 0;
  }
  const integration = environment.INTEGRATION_BRANCH || DEFAULT_BRANCH_NAMES.integration;
  const names = { ...DEFAULT_BRANCH_NAMES, integration };
  const parsed = parseBranch(branch, names);
  if (parsed.kind === "invalid" && branch.endsWith(`.${integration}`)) {
    return reportErrors(
      [`"${branch}" can't be a subdomain: use lowercase letters, digits and hyphens before .${integration}.`],
      write,
    );
  }
  if (parsed.kind !== "feature") {
    write(`${branch} is not a feature branch: nothing to do.`);
    return 0;
  }
  const { VERCEL_PROJECT_ID: project, VERCEL_TEAM_ID: team, VERCEL_TOKEN: token } = environment;
  if (!project || !team || !token) {
    return reportErrors(["vercel-project-id, vercel-team-id and vercel-token are required with a base domain."], write);
  }
  const domain = branchDomain(branch, baseDomain, names)!;
  const event = environment.EVENT === "delete" ? "delete" : "create";
  try {
    await updateBranchDomain({ event, domain, branch, project, team, token, fetch });
  } catch (error) {
    return reportErrors([(error as Error).message], write);
  }
  reportNotice(
    event === "create" ? `${branch} is served on https://${domain} (Vercel team only)` : `removed https://${domain}`,
    write,
  );
  return 0;
}
