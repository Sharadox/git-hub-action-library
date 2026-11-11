// Entry point of the branch-flow action (run by Node with --conditions=sharadox-source).
import { runBranchFlow } from "@sharadox/git-hub-action-library/run-branch-flow";

process.exitCode = runBranchFlow(process.env, console.log);
