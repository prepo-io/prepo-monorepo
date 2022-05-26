// // import { BigNumber } from '@ethersproject/bignumber'
// // import { expect } from 'chai'
// // import { createFixtureLoader, MockProvider } from 'ethereum-waffle'
// // import { ContractName } from '../typechain/ContractName'
// // import { contractNameFixture } from './fixtures'
// // import { expandTo18Decimals, JunkAddress } from './utils'

// describe('ContractName', () => {
//     const provider = new MockProvider({
//         ganacheOptions: {
//             hardfork: 'istanbul',
//             mnemonic:
//                 'horn horn horn horn horn horn horn horn horn horn horn horn',
//             gasLimit: 9999999,
//         },
//     })
//     const [deployer, user1, user2] = provider.getWallets()
//     const loadFixture = createFixtureLoader([deployer, user1, user2], provider)

//     let contractName: ContractName

//     beforeEach(async () => {
//         const fixture = await loadFixture(contractNameFixture)
//         contractName = fixture.contractName
//     })

//     describe('functionName', async () => {
//         it('should have the name contract name', async () => {
//             expect(await contractName.name()).to.eq('contract name')
//         })
//         it('should have 1 million total supply', async () => {
//             expect(await contractName.totalSupply()).to.eq(BigNumber.from(1000000))
//         })
//         it('should not allow foo', async () => {
//             await expect(
//                 contractName.foo(BigNumber.from(123))
//             ).to.be.revertedWith('foo not allowed')
//         })
//     })
// })
