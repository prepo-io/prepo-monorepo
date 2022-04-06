# prePO Monorepo

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

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
