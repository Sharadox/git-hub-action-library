import type { BranchNames } from "@sharadox/git-hub-action-library/branch/type";

/** A push (no target) or a pull request from `branch` into `target`. */
export interface BranchFlowCheck {
  branch: string;
  target?: string;
  names?: BranchNames;
}
