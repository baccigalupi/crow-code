import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  pruneRecovery,
  recordRecovery,
  recoveryPending,
} from '../../../agents/hooks/recovery-state.ts'

describe('recovery-state', () => {
  it('when a recovery is recorded, recoveryPending returns true', async () => {
    const projectDirectory = Deno.makeTempDirSync()

    await recordRecovery(projectDirectory, 'one', 'first')
    const pending = await recoveryPending(projectDirectory, 'one', 'first')

    Deno.removeSync(projectDirectory, { recursive: true })

    expect(pending).toBe(true)
  })

  it('when no recovery is recorded, recoveryPending returns false', async () => {
    const projectDirectory = Deno.makeTempDirSync()

    const pending = await recoveryPending(projectDirectory, 'one', 'first')

    Deno.removeSync(projectDirectory, { recursive: true })

    expect(pending).toBe(false)
  })

  it('when a marker exists for one pair, other pairs report not pending', async () => {
    const projectDirectory = Deno.makeTempDirSync()
    await recordRecovery(projectDirectory, 'one', 'first')

    const otherPrompt = await recoveryPending(projectDirectory, 'one', 'second')
    const otherSession = await recoveryPending(projectDirectory, 'two', 'first')

    Deno.removeSync(projectDirectory, { recursive: true })

    expect(otherPrompt).toBe(false)
    expect(otherSession).toBe(false)
  })

  it('when pruning, non-current markers are removed and the current is kept', async () => {
    const projectDirectory = Deno.makeTempDirSync()
    await recordRecovery(projectDirectory, 'one', 'first')
    await recordRecovery(projectDirectory, 'two', 'second')

    await pruneRecovery(projectDirectory, 'one', 'first')
    const kept = await recoveryPending(projectDirectory, 'one', 'first')
    const pruned = await recoveryPending(projectDirectory, 'two', 'second')

    Deno.removeSync(projectDirectory, { recursive: true })

    expect(kept).toBe(true)
    expect(pruned).toBe(false)
  })
})
