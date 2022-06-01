# prePO Acquisition Royale

This repository contains all the core smart contracts for the Acquisition Royale Game

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

Prettify Contracts: `yarn sl`
Check Contract Styling: `yarn sh`
Check Contract Sizes: `yarn size`
Compile Contracts: `yarn c`
Run Tests: `yarn t`
Prettify TypeScript files: `yarn l`

### Run Contract Tests & Get Callstacks

In one terminal run `yarn hardhat node`

Then in another run `yarn t`

### Configuration

Edit `hardhat.config.ts` to setup connections to different networks. Add your Infura API key and mnemonic to `.env`

### Deploy Locally

`yarn hardhat node` will launch a JSON-RPC node locally on `localhost:8545`. 

Your contract will automatically be deployed after running `yarn hardhat node` due to `hardhat-deploy`.

`hardhat-deploy` will use what's defined in `deploy/deploy.ts`

### Deploy to Ethereum

The following command will allow you to specify an external Ethereum network to deploy your contract on:

`yarn hardhat --network <networkName> deploy`

### Verify on Etherscan

Add Etherscan API key to `.env`, then run:

`yarn hardhat verify-contract --contract-name <CONTRACT_NAME> --address <DEPLOYED_ADDRESS>`

### The Graph

1. https://thegraph.com/docs/deploy-a-subgraph#create-a-graph-explorer-account

2. https://thegraph.com/docs/deploy-a-subgraph#store-the-access-token

3. https://thegraph.com/docs/deploy-a-subgraph#create-the-subgraph (subgraph name could be `project-name-v1`)

4. Update `repository`, `address` and `startBlock` (set to just before contract deployment block) in `subgraph.yaml`

5. Code generation (run after changes to GraphQL schema or contract ABIs): `yarn graph codegen`

6. Build (final step before deployment): `yarn graph build`

7. Run `graph deploy <SUBGRAPH_NAME> --ipfs https://api.thegraph.com/ipfs/ --node https://api.thegraph.com/deploy/`

### Deployed Addresses

| Network | Contract      | Address |
| ----------- | ----------- | ----------- |
| Goerli | `AcquisitionRoyale` | `0xe5a9a742b39C0C34286baC2cd5f0Ab6fde817A88`
| Goerli | `AcquisitionRoyaleConsumables` | `0xAf3840b7AefF037d93F4621A8aa14478D8C26dF0`
| Goerli | `MerkleProofVerifier` | `0xD46C987902406Ea6bc4Cc1D8E476844742Ed2a72`
| Goerli | `RunwayPoints` | `0xB8dE9A0C766955cAf641d39b66a3C0c2959863C2`
