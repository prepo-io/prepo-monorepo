# @prepo-io/stores

MobX Stores that are reused on prePO repositories

## Pre Installation

- Make sure that you authenticate by logging in to npm, use the following command:

```bash
npm login --scope=@prepo-io --registry=https://npm.pkg.github.com
```

Helpful link - [Authenticating with a personal access token](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-with-a-personal-access-token)

## 📦 Install

```bash
yarn add @prepo-io/stores
```

## Local development

1. Make sure you have previously done the command: `yarn setup:dev` on the root folder of this repository.

2. Start listening for changes on the typescript files so it compiles the library on each save

```bash
yarn dev
```

3. In the application you want to work run the following command

```bash
yarn link @prepo-io/stores
```

## Troubleshooting

You might need to run in this project if you get "Invalid hook call" error with missmatched React versions.

```bash
npm link ../<project-name>/node_modules/react
```
