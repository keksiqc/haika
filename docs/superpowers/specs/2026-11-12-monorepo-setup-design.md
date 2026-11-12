# Monorepo setup design

Date: 2026-11-12

## Goal

Turn the repository into a pnpm workspace (several packages in one repository) that turbo (a task runner with a cache) builds and tests. This step creates the structure only. It adds no working code. A later step ports the nano-hooks source into the packages.

## Packages

All packages live in `packages/`. Every package is ESM only, uses TypeScript, and builds with tsdown.

| Directory         | Name            | Command        | Role                                                          |
| ----------------- | --------------- | -------------- | ------------------------------------------------------------- |
| `packages/core`   | `@haika/core`   | none           | Git helpers, configuration loading, and the JSON schema.      |
| `packages/staged` | `@haika/staged` | `haika-staged` | Runs commands on staged files. Depends on core.               |
| `packages/hooks`  | `@haika/hooks`  | `haika-hooks`  | Installs and runs Git hooks. Depends on core.                 |
| `packages/haika`  | `haika`         | `haika`        | Umbrella package. Depends on hooks and staged.                |
| `packages/init`   | `@haika/init`   | `haika-init`   | Setup flow. The user runs `npx @haika/init`. Depends on core. |

Rules for the dependencies:

- `@haika/staged` is an optional peer dependency of `@haika/hooks`. If the configuration has a `staged` key and staged is missing, hooks stops with an error that tells the user to install `@haika/staged`.
- The hook scripts that hooks writes call a command name that hooks receives as an option. The default is `haika-hooks`. The `haika` package passes `haika`. This is needed because pnpm does not put the commands of indirect dependencies in `node_modules/.bin`.
- `@haika/init` has one command, so `npx @haika/init` runs it. It will later install `haika` and write the configuration. It does not depend on `haika` at run time.
- All commands read the same configuration format, loaded by core. The `staged` patterns stay under `pre-commit.staged`.
- The JSON schema is one file, `packages/core/schema.json`, exported as `@haika/core/schema.json`.
- Packages link to each other with `workspace:*`.

## Files in each package

Each package gets these files and no others:

- `package.json` with version `0.0.0`, `"type": "module"`, `exports`, `files: ["dist"]`, and `publishConfig.access: "public"`. A package with a command also has a `bin` field that points to `dist/cli.mjs`.
- `tsdown.config.ts` with `dts: true`, `exports: true`, and `publint: true`.
- `tsconfig.json` that extends the root `tsconfig.json`.
- `src/index.ts` that holds only `export {}`.
- `src/cli.ts` that holds only `export {}`, for packages with a command.

The `export {}` files are placeholders so that tsdown has an entry to build. They hold no logic.

## Root files

- `pnpm-workspace.yaml` lists `packages/*`. It sets `catalogMode: prefer` and `trustPolicy: no-downgrade`. It has a `catalog` with the versions of typescript, tsdown, vitest, and `@types/node`. The versions come from the antfu `starter-ts` template: typescript `^6.0.3`, tsdown `^0.23.7`, vitest `^5.1.0`, `@types/node` `^26.6.6`.
- `turbo.json` has three tasks. `build` depends on `^build` and outputs `dist/**`. `typecheck` depends on `^build`. `test` depends on `^build`.
- `tsconfig.json` copies the compiler options of `starter-ts`: target and lib `ESNext`, module `Preserve`, `strict`, `noEmit`, `esModuleInterop`, `verbatimModuleSyntax`, and `skipLibCheck`.
- `package.json` keeps oxlint, oxfmt, and the `lint` and `fmt` scripts. It adds turbo and bumpp. The scripts `build`, `typecheck`, and `test` call `turbo run`. The `release` script calls `bumpp -r`, which sets one version in all packages.
- `vitest.config.js` is deleted. It matched `test/**/*.test.js`, which does not fit TypeScript packages. Each package uses the vitest defaults. The 30 second timeout returns in the package that first needs it for Git tests.

Each package has `devDependencies` on typescript, tsdown, vitest, and `@types/node`, all with `catalog:`. pnpm isolates dependencies, so a package cannot use a tool that only the root installed.

## Tasks and gates

- `pnpm lint` and `pnpm fmt` run oxlint and oxfmt once at the root. oxlint already finds files in all packages.
- `pnpm test` runs `turbo run test`. Each package runs `vitest run --passWithNoTests`, because the packages have no tests yet.
- `pnpm build` and `pnpm typecheck` run through turbo.
- The CI gate in AGENTS.md stays `pnpm lint && pnpm fmt && pnpm test`. The `test` task depends on `build`, so CI builds first.

## Releases

All packages share one version, and the Git tag matches it. The existing release workflow runs `pnpm -r publish --access public --no-git-checks`, which publishes every workspace package. The workflow does not change in this step.

## Left out on purpose

These parts of `starter-ts` do not fit this project now: eslint and its plugins, knip, simple-git-hooks, nano-staged, tsx, the `skills` packages, tsnapi, and tsdown-stale-guard. The project keeps oxlint, oxfmt, and its own hooks later.

## Not in this step

- Porting the nano-hooks source, tests, or `MIGRATION.md`.
- Rewriting the root `README.md`, which still describes nano-hooks.
- A `repository` field in each `package.json`. The owner must supply the GitHub URL.
- A `@haika/testing` package, the commit-message check, and a separate schema package.

## Open items for the owner

1. Add `pnpm typecheck` to the CI gate in AGENTS.md? That changes a rule, so the owner decides.
2. Keep `bumpp` for releases, or bump versions by hand?
3. Give the GitHub repository URL for the `repository` field.

## Success criteria

After the scaffold, these commands must pass on a clean checkout:

1. `pnpm install`
2. `pnpm build`, which creates `dist/` in all five packages.
3. `pnpm typecheck`
4. `pnpm lint && pnpm fmt && pnpm test`
