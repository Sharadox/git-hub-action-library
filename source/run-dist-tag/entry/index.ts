// Entry point of the prerelease cleanup step (run by Node with --conditions=sharadox-source).
import { runDistTag } from "@sharadox/git-hub-action-library/run-prerelease";

process.exitCode = runDistTag(process.env, console.log);
