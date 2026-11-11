import type { BranchDomainUpdate } from "@sharadox/git-hub-action-library/vercel-domain/type";

const API = "https://api.vercel.com";

/**
 * Adds a domain to a Vercel project, served from one git branch, or removes it. Throws with Vercel's answer when
 * the request is refused.
 *
 * @example
 * await updateBranchDomain({ event: "create", domain: "login.development.sharadox.com", branch: "login.development",
 *   project: "prj_…", team: "team_…", token });
 */
export async function updateBranchDomain({
  event,
  domain,
  branch,
  project,
  team,
  token,
  fetch = globalThis.fetch,
}: BranchDomainUpdate): Promise<void> {
  const response =
    event === "create"
      ? await fetch(`${API}/v10/projects/${project}/domains?teamId=${team}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ name: domain, gitBranch: branch }),
        })
      : await fetch(`${API}/v9/projects/${project}/domains/${domain}?teamId=${team}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
  if (!response.ok) {
    throw new Error(`Vercel refused to ${event === "create" ? "add" : "remove"} ${domain}: ${await response.text()}`);
  }
}
