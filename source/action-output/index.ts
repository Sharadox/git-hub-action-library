import type { Write } from "@sharadox/git-hub-action-library/action-output/type";

/**
 * Writes each problem as a GitHub error annotation. Returns the process exit code: 1 when there were problems.
 *
 * @example
 * process.exitCode = reportErrors(["Only development merges into index."], console.log);
 */
export function reportErrors(errors: readonly string[], write: Write): number {
  for (const error of errors) write(`::error::${error}`);
  return errors.length ? 1 : 0;
}

/** Writes a GitHub notice annotation, shown on the workflow run's summary. */
export function reportNotice(message: string, write: Write): void {
  write(`::notice::${message}`);
}
