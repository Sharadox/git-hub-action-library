// Entry point of the publish action's release check (run by Node with --conditions=sharadox-source).
import { runReleaseCheck } from "@sharadox/git-hub-action-library/run-release-check";

process.exitCode = runReleaseCheck(process.env, console.log);
