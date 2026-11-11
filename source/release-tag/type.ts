/** What is known about a release tag when it is pushed. */
export interface ReleaseTag {
  /** The pushed tag, for example `v1.2.3`. */
  tag: string;
  /** The version in package.json. */
  version: string;
  /** package.json's `private` field. */
  isPrivate: boolean;
  /** Whether the tagged commit is on the production branch. */
  onProduction: boolean;
}
