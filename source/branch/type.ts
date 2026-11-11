/** The two long-lived branches of a repository. */
export interface BranchNames {
  /** Production, for example `index`. */
  production: string;
  /** Where finished features are integrated before production, for example `development`. */
  integration: string;
}

/** What a branch is in the flow. */
export type BranchKind =
  | { kind: "production" }
  | { kind: "integration" }
  | { kind: "feature"; feature: string }
  | { kind: "dependabot" }
  | { kind: "invalid" };
