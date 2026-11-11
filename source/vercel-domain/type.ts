/** The subset of `fetch` the Vercel calls need, so tests can replace it. */
export type Fetch = (
  url: string,
  init: { method: string; headers: Record<string, string>; body?: string },
) => Promise<{
  ok: boolean;
  status: number;
  text: () => Promise<string>;
  json: () => Promise<unknown>;
}>;

export interface BranchDomainUpdate {
  /** `create` adds the domain; `delete` removes it. */
  event: "create" | "delete";
  domain: string;
  branch: string;
  /** Vercel project id (`prj_…`). */
  project: string;
  /** Vercel team id (`team_…`). */
  team: string;
  /** A Vercel token allowed to manage the project's domains. */
  token: string;
  fetch?: Fetch;
}
