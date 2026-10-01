import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  pruneRecovery,
  recordRecovery,
  recoveryPending,
} from '../../../agents/hooks/recovery-state.ts'
import { clearDirectory } from '../../support/fixtures.ts'

describe('recovery-state', () => {
  it('when a recovery is recorded, recoveryPending returns true', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/recovery-state/recorded'

    await recordRecovery(projectDirectory, 'one', 'first')
    const pending = await recoveryPending(projectDirectory, 'one', 'first')
    await clearDirectory(projectDirectory)

    expect(pending).toBe(true)
  })

  it('when no recovery is recorded, recoveryPending returns false', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/recovery-state/none'

    const pending = await recoveryPending(projectDirectory, 'one', 'first')

    expect(pending).toBe(false)
  })

  it('when a marker exists for one pair, other pairs report not pending', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/recovery-state/other-pairs'

    await recordRecovery(projectDirectory, 'one', 'first')
    const otherPrompt = await recoveryPending(projectDirectory, 'one', 'second')
    const otherSession = await recoveryPending(projectDirectory, 'two', 'first')
    await clearDirectory(projectDirectory)

    expect(otherPrompt).toBe(false)
    expect(otherSession).toBe(false)
  })

  it('when pruning, non-current markers are removed and the current is kept', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/recovery-state/pruned'

    await recordRecovery(projectDirectory, 'one', 'first')
    await recordRecovery(projectDirectory, 'two', 'second')
    await pruneRecovery(projectDirectory, 'one', 'first')
    const kept = await recoveryPending(projectDirectory, 'one', 'first')
    const pruned = await recoveryPending(projectDirectory, 'two', 'second')
    await clearDirectory(projectDirectory)

    expect(kept).toBe(true)
    expect(pruned).toBe(false)
  })
})
