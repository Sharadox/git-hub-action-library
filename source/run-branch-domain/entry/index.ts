// Entry point of the branch-domain action (run by Node with --conditions=sharadox-source).
import { runBranchDomain } from "@sharadox/git-hub-action-library/run-branch-domain";

process.exitCode = await runBranchDomain(process.env, console.log);
