import type { Fetch } from "@sharadox/git-hub-action-library/vercel-domain/type";

export interface BranchDeploymentCleanup {
  /** The git branch whose deployments go, for example "login.development". */
  branch: string;
  /** Vercel project id (`prj_…`). */
  project: string;
  /** Vercel team id (`team_…`). */
  team: string;
  /** A Vercel token allowed to manage the project's deployments. */
  token: string;
  fetch?: Fetch;
}

/** The part of a Vercel deployment listing the cleanup reads. */
export interface DeploymentListing {
  deployments: { uid: string; target?: string | null; meta?: { githubCommitRef?: string } }[];
  pagination?: { next?: number | null };
}
