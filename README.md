# prePO Monorepo

[![GitHub license](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://github.com/prepo-io/prepo-monorepo/blob/main/LICENSE)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

[![prePO](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/XSQRdJactS)
[![prePO Discord](https://badgen.net/discord/members/XSQRdJactS)](https://discord.gg/XSQRdJactS)

[![Twitter Follow](https://img.shields.io/twitter/follow/prepo_io?style=social&logo=twitter)](https://twitter.com/prepo_io)

The monorepo for all prePO applications.

## What's inside?

This monorepo is based on [Turborepo](https://github.com/vercel/turborepo).
It uses [Yarn](https://classic.yarnpkg.com/lang/en/) as a package manager. It includes the following packages/apps:

### Apps and Packages

- `prepo-docs`: Our documentation that can be found on this url: [docs.prepo.io](https://docs.prepo.io/).
- `prepo-react-boilerplate`: Boilerplate NextJs based application that we use for every new project we start.
- `config`: `eslint` configurations (includes `eslint-config-frontend` and `eslint-config-server`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo (includes `tsconfig/frontend.js`, `tsconfig/server.js` and `tsconfig/base.js`)

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Monorepo Stack

This boilerplate contains a modern stack for building Web3 apps:

- [Turborepo](https://github.com/vercel/turborepo) for running the monorepo structure
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Node Version Manager](https://github.com/nvm-sh/nvm) to know which node version we are currently supporting

## Get started

> Clone the repository:

```
git clone https://github.com/prepo-io/prepo-monorepo
```

> Install:

```
cd prepo-monorepo
yarn install
```

> Move to the folder of the application you want to run and run it

```
cd apps/prepo-x-y
yarn dev
```

## Work on a specific application

If you want to work on a specific application:

1. You should move your terminal to that specific folder. Example:

```
cd apps/[frontend/smart-contracts]/[app-name]
```

2. You should not do `yarn install` on the application folder. The only place to do `yarn install` is on the `root` folder. After that, your application should work as expected.
   Yarn workspaces will handle the instalation of your packages corresponding to your application `package.json`.
   If there's any package version that is re-used across other applications, that will also be handled automatically.

## FAQ

### Which one is the name of my application on [yarn workspaces](https://classic.yarnpkg.com/en/docs/cli/workspace)?

To get that the name of your application, you just need to open the `package.json` file inside your application folder and that would be the `name` property written there.

### How do I install a new dependency on my application?

Locate the name of your application in yarn workspaces.

Then you can run the command:

```
yarn workspace [yarn-workspace-application-name] add react
```

**Don't forget to remove the caret after installing to lock the version and re-run `yarn install` on the root folder.**

### How do I install a new dev dependency on my application?

Locate the name of your application in yarn workspaces.

Then you can run the command:

```
yarn workspace [yarn-workspace-application-name] add @types/react -D
```

**Don't forget to remove the caret after installing to lock the version and re-run `yarn install` on the root folder.**

### How do I install a dependency/dev dependency on the root package.json that will be shared across other apps?

Go to the root folder of this monorepo.

Then you can run the command:

```
yarn add dependency-name -W
```

Include `-D` if you are planning to install a dev dependency.

**Don't forget to remove the caret after installing to lock the version and re-run `yarn install` on the root folder.**

## Disclaimer

The AGPL V3 license only applies to the code within the repository. Any assets or other files (in part or whole) that already have a non-open-source license are excluded.
