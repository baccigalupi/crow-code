import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { stopDecision } from '../../../agents/hooks/stop-recovery.ts'

describe('stopDecision', () => {
  it('when a recovery is pending, returns a block decision', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/stop-after-blocked-tool/marker-exists'
    const input = { sessionId: 'one', promptId: 'first', stopHookActive: false }

    const decision = await stopDecision(input, projectDirectory)

    expect(decision).toMatchObject({ decision: 'block' })
  })

  it('when the stop hook is already active, returns null', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/stop-after-blocked-tool/marker-exists'
    const input = { sessionId: 'one', promptId: 'first', stopHookActive: true }

    const decision = await stopDecision(input, projectDirectory)

    expect(decision).toBeNull()
  })

  it('when no recovery is pending, returns null', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/stop-after-blocked-tool/no-marker'
    const input = { sessionId: 'one', promptId: 'first', stopHookActive: false }

    const decision = await stopDecision(input, projectDirectory)

    expect(decision).toBeNull()
  })
})
