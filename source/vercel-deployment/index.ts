import type {
  BranchDeploymentCleanup,
  DeploymentListing,
} from "@sharadox/git-hub-action-library/vercel-deployment/type";

const API = "https://api.vercel.com";

/**
 * Deletes every deployment Vercel built from a git branch, so a deleted branch leaves nothing behind. Production
 * deployments are never touched. Returns how many were deleted; throws with Vercel's answer when a request is
 * refused.
 *
 * @example
 * await deleteBranchDeployments({ branch: "login.development", project: "prj_…", team: "team_…", token }); // 3
 */
export async function deleteBranchDeployments({
  branch,
  project,
  team,
  token,
  fetch = globalThis.fetch,
}: BranchDeploymentCleanup): Promise<number> {
  const headers = { Authorization: `Bearer ${token}` };
  const found: string[] = [];
  let until: number | null | undefined;
  do {
    const page = await fetch(
      `${API}/v6/deployments?projectId=${project}&teamId=${team}&limit=100${until ? `&until=${until}` : ""}`,
      { method: "GET", headers },
    );
    if (!page.ok) throw new Error(`Vercel refused to list deployments: ${await page.text()}`);
    const listing = (await page.json()) as DeploymentListing;
    for (const deployment of listing.deployments) {
      if (deployment.meta?.githubCommitRef === branch && deployment.target !== "production") found.push(deployment.uid);
    }
    until = listing.pagination?.next;
  } while (until);
  for (const uid of found) {
    const response = await fetch(`${API}/v13/deployments/${uid}?teamId=${team}`, { method: "DELETE", headers });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Vercel refused to delete deployment ${uid}: ${await response.text()}`);
    }
  }
  return found.length;
}
