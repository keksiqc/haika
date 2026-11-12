# haika

[![license](https://shieldcn.dev/github/license/keksiqc/haika.svg?variant=secondary)][license-href]

haika is a small Git hooks manager. It has a runner for staged files and keeps its dependencies to a minimum. This repository is a pnpm workspace with several packages. You can use each package alone or install them together with `haika`.

Status: the packages are scaffolded, and the code is not ported yet. The commands in this file describe the planned behavior and do not work yet.

## Packages

| Package                              | Command        | Description                                                   |
| ------------------------------------ | -------------- | ------------------------------------------------------------- |
| [`haika`](./packages/haika)          | `haika`        | Installs hooks and runs staged files. Includes the two below. |
| [`@haika/hooks`](./packages/hooks)   | `haika-hooks`  | Installs and runs Git hooks.                                  |
| [`@haika/staged`](./packages/staged) | `haika-staged` | Runs commands on staged files.                                |
| [`@haika/init`](./packages/init)     | `haika-init`   | Guides you through the setup. Run it with `npx`.              |
| [`@haika/core`](./packages/core)     | none           | Shared Git helpers and configuration loading.                 |

## Quick start

haika requires Node 22, or Node 24 and later.

To set up a project with a guided flow, run this command:

```sh
npx @haika/init
```

To set up a project by hand, follow these steps:

1. Install the package:

   ```sh
   pnpm add -D haika
   ```

2. Add a `prepare` script and a `haika` key to `package.json`:

   ```json
   {
     "scripts": { "prepare": "haika" },
     "haika": {
       "pre-commit": {
         "staged": { "*.{js,ts}": "oxlint --fix" },
         "run": "npm run typecheck"
       },
       "commit-msg": "node scripts/check-msg.js $1"
     }
   }
   ```

3. Run `pnpm install`. The `prepare` script writes the hooks to your repository.

The [haika reference](./packages/haika/README.md) describes the configuration, the commands, and the behavior of the hooks.

## Development

This project uses pnpm workspaces, turbo, TypeScript, tsdown, oxlint, oxfmt, and vitest.

```sh
pnpm install
pnpm build
pnpm typecheck
pnpm lint
pnpm fmt
pnpm test
```

Before you open a pull request, make sure that `pnpm lint && pnpm fmt && pnpm test` passes. The `test` task builds the packages first. Commit messages follow Conventional Commits.

CI uses the Unit Test workflow from [`sxzz/workflows`](https://github.com/sxzz/workflows). The file is `.github/workflows/ci.yml`. It runs on each push and pull request to `main`.

### Release a version

All packages share one version.

1. Make sure that CI passes on `main`. The release workflow does not run lint or tests.
2. Run `pnpm release`. The command asks for the new version, sets it in every package, and creates the tag.
3. Push the commit and the tag, for example `v0.1.1`.

The release workflow is `.github/workflows/release.yml`, also from `sxzz/workflows`. It creates a GitHub release with notes from the Conventional Commit messages. Then it publishes the packages.

## Credits

The staged-file runner is adapted from [nano-staged](https://github.com/usmanyunusov/nano-staged), © Usman Yunusov, under the MIT License. haika restructured and changed the code. Report bugs in the runner to this repository, not to nano-staged.

The project layout follows the [starter-ts](https://github.com/antfu/starter-ts) template by Anthony Fu.

## License

[MIT](./LICENSE) License © [Keksi](https://github.com/keksiqc)

<!-- Badges -->

[license-href]: https://github.com/keksiqc/haika/blob/main/LICENSE
