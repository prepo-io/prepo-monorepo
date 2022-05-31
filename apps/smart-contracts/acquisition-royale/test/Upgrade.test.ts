/* ----- Commenting this test temporarily due to: https://github.com/prepo-io/prepo-monorepo/pull/79#pullrequestreview-988173873 ----- */

/* eslint-disable import/no-unresolved */
// import { ethers, network } from 'hardhat'
// import { expect } from 'chai'
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-ignore
// import { JsonRpcSigner } from 'ethers/node_modules/@ethersproject/providers'
// import ProxyAdmin from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json'
// import { BigNumber, Contract } from 'ethers'
// import {
//   mineBlock,
//   getLastTimestamp,
//   setNextTimestamp,
//   isolateNamedFields,
//   AddressZero,
// } from './utils'

// // This is how parameter fixtures should be created in the future.
// // Field names should exactly align with what is returned.
// // Utilizing the isolateNamedFields method, the filtered reponse from a getter method
// // can then be sent back and modified {...returnedParams, changethis: 1, andthis: 2}
// // to the setter. This will be crucial for upgrades tests, since we need to base tests off
// // changes to the current state and not initializing state from a blank slate.

// type PriceAndTimeParams = {
//   _startPrice: BigNumber
//   _endPrice: BigNumber
//   _startTime: BigNumber
//   _endTime: BigNumber
// }

// async function setFoundingPriceAndTime(
//   royale: Contract,
//   caller: JsonRpcSigner,
//   params: PriceAndTimeParams
// ): Promise<void> {
//   await royale
//     .connect(caller)
//     .setFoundingPriceAndTime(
//       params._startPrice,
//       params._endPrice,
//       params._startTime,
//       params._endTime
//     )
// }

// describe('Upgrade', () => {
//   let user: JsonRpcSigner
//   let governance: JsonRpcSigner
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   let snapshotId: any
//   let upgradedContract: Contract

//   const USER_ADDRESS = '0xEa83A49aa36d384483c46eCb74E1c59afAc10dc8'
//   const PROXY_ADDRESS = '0xa46afF3aB117b51f33dB178593552d0ca0B1365e'
//   const PROXY_ADMIN_ADDRESS = '0x9dBD39E9d476773A7d7e71F2912B0a2D96D52020'
//   const GOVERNANCE_ADDRESS = '0x29Db7027292ca162817a31f62453161b3d2eCEAe' // acquisitionroyale.eth
//   const TEST_TIME_DELAY = 10

//   const calculateAuctionPrice = async (royale: Contract, blockTime: number): Promise<BigNumber> => {
//     const blockTimeBN = BigNumber.from(blockTime)
//     const foundingParameters = await royale.getFoundingPriceAndTime()
//     const decayPerSecond = foundingParameters._startPrice
//       .sub(foundingParameters._endPrice)
//       .div(foundingParameters._endTime.sub(foundingParameters._startTime))
//       .add(1)
//     const auctionPrice = foundingParameters._startPrice.sub(
//       decayPerSecond.mul(blockTimeBN.sub(foundingParameters._startTime))
//     )
//     return auctionPrice.lt(foundingParameters._endPrice)
//       ? foundingParameters._endPrice
//       : auctionPrice
//   }

//   const setupFork = async (forkingBlock: number, adminOwner: string): Promise<void> => {
//     snapshotId = await ethers.provider.send('evm_snapshot', [])
//     await network.provider.request({
//       method: 'hardhat_reset',
//       params: [
//         {
//           forking: {
//             jsonRpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
//             blockNumber: forkingBlock,
//           },
//         },
//       ],
//     })

//     // impersonating user account
//     await network.provider.request({
//       method: 'hardhat_impersonateAccount',
//       params: [USER_ADDRESS],
//     })
//     user = await ethers.provider.getSigner(USER_ADDRESS)
//     // 10000 ethers, need to upgrade hardhat for this to work.
//     /*
//         await network.provider.send("hardhat_setBalance", [
//             USER_ADDRESS,
//             "0x21e19e0c9bab2400000",
//         ]);
//         */

//     // impersonating governance (proxy admin owner)
//     await network.provider.request({
//       method: 'hardhat_impersonateAccount',
//       params: [GOVERNANCE_ADDRESS],
//     })
//     governance = await ethers.provider.getSigner(GOVERNANCE_ADDRESS)

//     // deploying new AcquisitionRoyale implementation
//     const AcquisitionRoyaleFactory = await ethers.getContractFactory('AcquisitionRoyale')
//     const acquisitionRoyale = await AcquisitionRoyaleFactory.deploy()
//     await acquisitionRoyale.deployed()

//     /**
//      * Cannot use OZ upgrades library due to its reliance on chainID specific network manifest files.
//      * This means that the upgrades library doesn't support forking for one-off tests/scripts like we do here.
//      * Changing the config to have the hardhat network start from a fork will generate an accurate
//      * network manifest based on the forked state, but makes all tests run off forked state.
//      * This slows down our units tests considerably and is unnecessary except for upgrade testing.
//      *
//      * The workaround for this will be to directly reference OZ's ProxyAdmin contract and upgrade the implementation
//      * directly, thus circumventing the need for the upgrades library. Should only do this for testing since
//      * we still need the upgrades library to perform safety checks before any actual deployment.
//      *
//      * To ensure the contract you are upgrading is upgrade safe, run the upgrade deployment script on a local network.
//      * This is mainly for sanity tests to check the presence of added functionality and state preservation.
//      * Forking within the hardhat test framework allows upgrade testing to happen along with unit tests.
//      * Removes the need for setting up and configuring a custom local node everytime you want to perform upgrade testing.
//      */

//     // connecting to ProxyAdmin to perform upgrade
//     const deployer = await ethers.provider.getSigner(adminOwner)
//     const ProxyAdminFactory = await ethers.getContractFactory(
//       ProxyAdmin.abi,
//       ProxyAdmin.bytecode,
//       deployer
//     )
//     const proxyAdmin = ProxyAdminFactory.attach(PROXY_ADMIN_ADDRESS)

//     // upgrade contract
//     await proxyAdmin.upgrade(PROXY_ADDRESS, acquisitionRoyale.address)
//     upgradedContract = AcquisitionRoyaleFactory.attach(PROXY_ADDRESS)
//   }

//   it('Should maintain owner', async () => {
//     await setupFork(20829202, GOVERNANCE_ADDRESS)
//     expect(await upgradedContract.owner()).to.eq(GOVERNANCE_ADDRESS)
//   })

//   describe('# reclaimFunds', () => {
//     beforeEach(async () => {
//       // Block number that captures state of contract after the foundAuctioned bug with owner() was discovered.
//       await setupFork(21186417, USER_ADDRESS)
//     })

//     it('should only be callable by owner', async () => {
//       await expect(upgradedContract.connect(user).reclaimFunds()).revertedWith(
//         'Ownable: caller is not the owner'
//       )
//     })

//     it('should transfer any native token contract balance to the contract owner', async () => {
//       const balanceBefore = await governance.getBalance()
//       expect(await ethers.provider.getBalance(upgradedContract.address)).to.eq(
//         ethers.utils.parseEther('45')
//       )

//       await upgradedContract.connect(governance).reclaimFunds()

//       expect(await governance.getBalance()).to.eq(balanceBefore.add(ethers.utils.parseEther('45')))
//       expect(await ethers.provider.getBalance(upgradedContract.address)).to.eq(0)
//     })
//   })

//   describe('# foundAuctioned', () => {
//     beforeEach(async () => {
//       // Block number before change to MATIC instead of WETH was applied
//       await setupFork(20829202, GOVERNANCE_ADDRESS)
//     })

//     it('should prevent minting when founding has ended', async () => {
//       let currentFounding = await upgradedContract.getFoundingPriceAndTime()
//       currentFounding = isolateNamedFields(currentFounding)
//       const expiryTime = (await getLastTimestamp()) + TEST_TIME_DELAY
//       await setFoundingPriceAndTime(upgradedContract, governance, {
//         ...currentFounding,
//         _endTime: expiryTime,
//       })
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       mineBlock(ethers.provider as any, expiryTime)

//       await expect(upgradedContract.connect(user).foundAuctioned(1)).revertedWith(
//         'founding has ended'
//       )
//     })

//     it('should not allow minting without sufficient native token', async () => {
//       const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
//       const expectedAmount = await calculateAuctionPrice(upgradedContract, expectedTime)
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       await setNextTimestamp(ethers.provider as any, expectedTime)

//       await expect(
//         upgradedContract.connect(user).foundAuctioned(1, {
//           value: expectedAmount.sub(1),
//         })
//       ).revertedWith('insufficient MATIC')
//     })

//     it('should mint starting at the correct index', async () => {
//       const currentCounter = await upgradedContract.getAuctionCount()
//       expect(await upgradedContract.ownerOf(currentCounter)).to.eq(AddressZero)
//       const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
//       const expectedAmount = await calculateAuctionPrice(upgradedContract, expectedTime)
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       await setNextTimestamp(ethers.provider as any, expectedTime)

//       await upgradedContract.connect(user).foundAuctioned(1, { value: expectedAmount })

//       expect(await upgradedContract.ownerOf(currentCounter)).to.eq(USER_ADDRESS)
//     })

//     it('should charge the correct auction price for a founding', async () => {
//       const treasuryBalanceBefore = await governance.getBalance()
//       const userBalanceBefore = await user.getBalance()
//       expect(await ethers.provider.getBalance(upgradedContract.address)).to.eq(0)
//       const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
//       const expectedAmount = await calculateAuctionPrice(upgradedContract, expectedTime)
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       await setNextTimestamp(ethers.provider as any, expectedTime)

//       await upgradedContract.connect(user).foundAuctioned(1, { value: expectedAmount })

//       expect(await governance.getBalance()).to.eq(treasuryBalanceBefore.add(expectedAmount))
//       expect(await user.getBalance()).to.eq(userBalanceBefore.sub(expectedAmount))
//       expect(await ethers.provider.getBalance(upgradedContract.address)).to.eq(0)
//     })

//     it('should transfer any excess native token back to the user', async () => {
//       const treasuryBalanceBefore = await governance.getBalance()
//       const userBalanceBefore = await user.getBalance()
//       expect(await ethers.provider.getBalance(upgradedContract.address)).to.eq(0)
//       const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
//       const expectedAmount = await calculateAuctionPrice(upgradedContract, expectedTime)
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       await setNextTimestamp(ethers.provider as any, expectedTime)

//       await upgradedContract.connect(user).foundAuctioned(1, {
//         value: expectedAmount.add(1),
//       })

//       expect(await governance.getBalance()).to.eq(treasuryBalanceBefore.add(expectedAmount))
//       expect(await user.getBalance()).to.eq(userBalanceBefore.sub(expectedAmount))
//       expect(await ethers.provider.getBalance(upgradedContract.address)).to.eq(0)
//     })
//   })

//   afterEach(async () => {
//     await network.provider.request({
//       method: 'hardhat_reset',
//       params: [],
//     })
//     // disable forking and reset to not affect the wholes repo's test suite
//     await network.provider.send('evm_revert', [snapshotId])
//   })
// })
