/** Where action output goes; `console.log` in a workflow, a mock in tests. */
export type Write = (line: string) => void;

/** Environment variables, as `process.env` holds them. */
export type Environment = Readonly<Record<string, string | undefined>>;
