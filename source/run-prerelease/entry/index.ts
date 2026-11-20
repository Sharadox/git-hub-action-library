// Entry point of the prerelease action's version step (run by Node with --conditions=sharadox-source).
import { runPrerelease } from "@sharadox/git-hub-action-library/run-prerelease";

process.exitCode = runPrerelease(process.env, console.log);
