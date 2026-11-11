# @sharadox/git-hub-action-library

Reusable GitHub Actions for one branch flow, used by every Sharadox repository and open to anyone:

```
<feature>.development  ──squash──▶  development  ──merge──▶  index (production)
```

- `index` is production, `development` integrates finished features, and each piece of work has its own `<feature>.development` branch.
- Branch names are subdomains. A repository with a base domain serves `index` on `<domain>`, `development` on `development.<domain>` and `<feature>.development` on `<feature>.development.<domain>`.
- The production and integration names are inputs, so other teams can use `main` and `staging`.

| Action          | What it does                                                                                                                                                                                                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `branch-flow`   | Fails when a branch name is outside the flow, or a pull request merges the wrong way.                                                                                                                                                                                                              |
| `verify`        | Checks out, installs with pnpm (with private packages, using a read-only npm token) and runs Turborepo tasks. It can install Playwright's Chromium (on its own when Ubuntu's package mirrors are unreachable, as the runner image already has its libraries) and keep the test results on failure. |
| `branch-domain` | On branch create/delete, adds or removes `<feature>.development.<base-domain>` on a Vercel project.                                                                                                                                                                                                |
| `publish`       | On a `v<version>` tag on production: checks the tag, runs the checks, publishes to npm (provenance for public packages, Trusted Publishing when no token is given) and attaches the package to a GitHub release.                                                                                   |

The check names stay `Branch flow` and `Verify`, because the actions are steps inside your own jobs, so rulesets requiring those checks keep working.

## Use

```yaml
# .github/workflows/continuous-integration.yml
name: Continuous integration
on:
  push:
  pull_request:
    branches: [index, development]
jobs:
  branch-flow:
    name: Branch flow
    runs-on: ubuntu-latest
    steps:
      - uses: Sharadox/git-hub-action-library/branch-flow@v0.1.0
  verify:
    name: Verify
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: Sharadox/git-hub-action-library/verify@v0.1.0
        with:
          tasks: format:check lint type-check test:unit build test:end-to-end
          browser: "true"
          npm-install-token: ${{ secrets.NPM_INSTALL_TOKEN }}
          turborepo-token: ${{ secrets.TURBOREPO_TOKEN }}
          turborepo-team: ${{ vars.TURBOREPO_TEAM }}
          turborepo-remote-cache-signature-key: ${{ secrets.TURBOREPO_REMOTE_CACHE_SIGNATURE_KEY }}
```

```yaml
# .github/workflows/branch-domain.yml
name: Branch domain
on: [create, delete]
jobs:
  domain:
    name: Branch domain
    if: github.event.ref_type == 'branch'
    runs-on: ubuntu-latest
    steps:
      - uses: Sharadox/git-hub-action-library/branch-domain@v0.1.0
        with:
          base-domain: ${{ vars.BASE_DOMAIN }}
          vercel-project-id: ${{ vars.VERCEL_PROJECT_ID }}
          vercel-team-id: ${{ vars.VERCEL_TEAM_ID }}
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

```yaml
# .github/workflows/publish.yml
name: Publish
on:
  push:
    tags: ["v*"]
permissions:
  contents: write
  id-token: write
jobs:
  publish:
    name: Publish
    runs-on: ubuntu-latest
    steps:
      - uses: Sharadox/git-hub-action-library/publish@v0.1.0
```

All inputs, with defaults, are in each action's `action.yml`. Every secret and variable belongs to the calling repository; none is shared between repositories.

## The code behind the actions

The decisions are plain TypeScript functions in `source/`, published to npm as `@sharadox/git-hub-action-library`. Use them in your own tools:

| Import                                                            | Exports                                                                                                                         |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `@sharadox/git-hub-action-library/branch`                         | `parseBranch(branch, names?)` → production, integration, feature (with its name), dependabot or invalid; `DEFAULT_BRANCH_NAMES` |
| `…/branch-flow`                                                   | `checkBranchFlow({ branch, target?, names? })` → list of problems                                                               |
| `…/branch-domain`                                                 | `branchDomain(branch, baseDomain, names?)` → the branch's address, or `undefined`                                               |
| `…/release-tag`                                                   | `checkReleaseTag({ tag, version, isPrivate, onProduction })` → list of problems                                                 |
| `…/vercel-domain`                                                 | `updateBranchDomain({ event, domain, branch, project, team, token, fetch? })`                                                   |
| `…/action-output`                                                 | `reportErrors(errors, write)` → exit code; `reportNotice(message, write)`                                                       |
| `…/run-branch-flow`, `…/run-branch-domain`, `…/run-release-check` | the actions' entry logic, reading environment variables                                                                         |

```ts
import { branchDomain } from "@sharadox/git-hub-action-library/branch-domain";

branchDomain("login.development", "platform.sharadox.com"); // "login.development.platform.sharadox.com"
```

The actions run the TypeScript directly with the current Node LTS (`--conditions=sharadox-source`), so there's no build step between a change and a tag. Every function has unit tests at 100% coverage (`pnpm test:unit`).

## Develop

`pnpm verify` runs formatting, lint, type-check, tests with coverage and the build. This repository checks itself with its own actions (`uses: ./verify`). Releases are `v<version>` tags on `index`.

## Licence

Licença Sharadox de Código Aberto, versão 0.1.0. See [português](LICENCA.md) (the binding text) and the [English translation](LICENSE.md).
