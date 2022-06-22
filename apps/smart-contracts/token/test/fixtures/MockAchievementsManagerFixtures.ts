import { MockContract, smock } from '@defi-wonderland/smock'

export async function smockMockAchievementsManagerFixture(): Promise<MockContract> {
  const smockMockAchievementsManagerFactory = await smock.mock('MockAchievementsManager')
  // eslint-disable-next-line @typescript-eslint/return-await
  return await smockMockAchievementsManagerFactory.deploy()
}
