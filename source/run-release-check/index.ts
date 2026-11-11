import { readFileSync } from "node:fs";
import { reportErrors } from "@sharadox/git-hub-action-library/action-output";
import type { Write } from "@sharadox/git-hub-action-library/action-output/type";
import { checkReleaseTag } from "@sharadox/git-hub-action-library/release-tag";
import type { Environment } from "@sharadox/git-hub-action-library/action-output/type";

/**
 * The publish action's first step: checks `TAG` against package.json and `ON_PRODUCTION` ("true" when the tagged
 * commit is on the production branch). Returns the exit code.
 */
export function runReleaseCheck(
  environment: Environment,
  write: Write,
  readPackage: () => string = () => readFileSync("package.json", "utf8"),
): number {
  const manifest = JSON.parse(readPackage()) as { version: string; private?: boolean };
  return reportErrors(
    checkReleaseTag({
      tag: environment.TAG ?? "",
      version: manifest.version,
      isPrivate: manifest.private === true,
      onProduction: environment.ON_PRODUCTION === "true",
    }),
    write,
  );
}
