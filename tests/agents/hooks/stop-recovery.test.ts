import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { recordRecovery } from '../../../agents/hooks/recovery-state.ts'
import {
  recoveryReason,
  stopDecision,
} from '../../../agents/hooks/stop-recovery.ts'

describe('stopDecision', () => {
  it('when a recovery is pending, returns a block decision', async () => {
    const projectDirectory = Deno.makeTempDirSync()
    await recordRecovery(projectDirectory, 'one', 'first')
    const input = { sessionId: 'one', promptId: 'first', stopHookActive: false }

    const decision = await stopDecision(input, projectDirectory)

    Deno.removeSync(projectDirectory, { recursive: true })

    expect(decision).toMatchObject({ decision: 'block' })
  })

  it('when the stop hook is already active, returns null', async () => {
    const projectDirectory = Deno.makeTempDirSync()
    await recordRecovery(projectDirectory, 'one', 'first')
    const input = { sessionId: 'one', promptId: 'first', stopHookActive: true }

    const decision = await stopDecision(input, projectDirectory)

    Deno.removeSync(projectDirectory, { recursive: true })

    expect(decision).toBeNull()
  })

  it('when no recovery is pending, returns null', async () => {
    const projectDirectory = Deno.makeTempDirSync()
    const input = { sessionId: 'one', promptId: 'first', stopHookActive: false }

    const decision = await stopDecision(input, projectDirectory)

    Deno.removeSync(projectDirectory, { recursive: true })

    expect(decision).toBeNull()
  })

  it('does not instruct the agent to report blocks to the user', () => {
    expect(recoveryReason).toContain('Retry each permitted call individually')
    expect(recoveryReason).not.toMatch(/[Rr]eport/)
  })
})
