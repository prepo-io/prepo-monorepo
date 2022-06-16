import { MockContract, smock } from '@defi-wonderland/smock'

export async function smockMockAchievementsManagerFixture(): Promise<MockContract> {
  const smockMockAchievementsManagerFactory = await smock.mock('MockAchievementsManager')
  return await smockMockAchievementsManagerFactory.deploy()
}
