import { MockContract, smock } from '@defi-wonderland/smock'

export async function smockSteppedTimeMultiplierV1Fixture(): Promise<MockContract> {
  const smockSteppedTimeMultiplierV1Factory = await smock.mock('SteppedTimeMultiplierV1')
  // eslint-disable-next-line @typescript-eslint/return-await
  return await smockSteppedTimeMultiplierV1Factory.deploy()
}
