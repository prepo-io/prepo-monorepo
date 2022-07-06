# prePO Core Smart Contracts

This repository contains all the core smart contracts for prePO V1.

### Visual Studio Code Extensions

- REQUIRED: solidity (Juan Blanco)
- REQUIRED: Prettier - Code formatter (Prettier)
- Better Comments (Aaron Bond)
- Bracket Pair Colorizer (CoenraadS)
- Guides (spywhere)
- indent-rainbow (oderwat)

### Install

Run `yarn`

### Commands

Prettify Contracts: `yarn sl`<br/>
Check Contract Styling: `yarn sh`<br/>
Check Contract Sizes: `yarn size`<br/>
Compile Contracts: `yarn c`<br/>
Run Tests: `yarn t`<br/>
Run Tests w/ Code Coverage: `yarn t:coverage`<br/>
Prettify TypeScript files: `yarn l`<br/>

### Run Contract Tests & Get Callstacks

In one terminal run `yarn hardhat node`

Then in another run `yarn t`

### Configuration

Edit `hardhat.config.ts` to setup connections to different networks. Add your Infura API key and mnemonic to `.env`

### Deploy Locally

`yarn hardhat node` will launch a JSON-RPC node locally on `localhost:8545`.

Running `yarn hardhat node` without the `--no-deploy` tag will also execute everything defined in the `deploy` folder.

It is advised to instead run deployments separately using `yarn hardhat deploy` with specific `--tags` to ensure you only  
deploy what you need, e.g. `yarn hardhat deploy --network 'localhost' --tags 'Collateral'`

Because our scripts use `hardhat-upgrades` to deploy our upgradeable contracts, they are not managed by `hardhat-deploy`.  
Upgradeable deployment addresses are kept track of separately in a local `.env` file.

`hardhat-deploy` will automatically call deployment scripts for any dependencies of a specified `tag`.  
Per the tag dependency tree below, specifying `PrePOMarketFactory` under `--tags`, will deploy the entire PrePO core stack.  
A mock strategy can be deployed as well for testing purposes with the `MockStrategy` tag.

     CollateralDepositRecord   AccountAccessController
         ^              ^                  ^
         |              |                  |
         |              |                  |
    WithdrawHook   DepositHook-------------+              SingleStrategyController   BaseToken
         ^              ^                                             ^                  ^
         |              |                                             |                  |
         |              |                                             |                  |
         +--------------+-----------------------Collateral------------+------------------+
                                                    ^
                                                    |
                                                    |
                                          +---------+---------+
                                          |                   |
                                          |                   |
                                          |                   |
                                 PrePOMarketFactory     MockStrategy
                                                         (optional)

### Deploy to Ethereum

The following command will allow you to specify an external Ethereum network to deploy your contract on:

`yarn hardhat --network <networkName> deploy`

### Verify on Etherscan

Add Etherscan API key to `.env`, then run:

`yarn hardhat verify-contract --contract-name <CONTRACT_NAME> --address <DEPLOYED_ADDRESS>`

### Verify on Polygonscan

Add POLYGONSCAN_API_KEY API key to `.env`, then run:

`yarn hardhat verify <CONTRACT_ADDRESS> --network matic "PARAM 1" "PARAM 2"...`

### The Graph

1. https://thegraph.com/docs/deploy-a-subgraph#create-a-graph-explorer-account

2. https://thegraph.com/docs/deploy-a-subgraph#store-the-access-token

3. https://thegraph.com/docs/deploy-a-subgraph#create-the-subgraph (subgraph name could be `project-name-v1`)

4. Update `repository`, `address` and `startBlock` (set to just before contract deployment block) in `subgraph.yaml`

5. Code generation (run after changes to GraphQL schema or contract ABIs): `yarn graph codegen`

6. Build (final step before deployment): `yarn graph build`

7. Run `graph deploy <SUBGRAPH_NAME> --ipfs https://api.thegraph.com/ipfs/ --node https://api.thegraph.com/deploy/`
