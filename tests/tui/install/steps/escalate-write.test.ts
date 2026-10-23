import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import { emptyText } from '../../../../src/tui/input-text.ts'
import { EscalateWriteStep } from '../../../../src/tui/install/steps/escalate-write.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('EscalateWriteStep', () => {
  it('when asked for its state, returns the escalate write input', () => {
    const installStore = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      additionalRead: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('escalateWrite'),
      confirmation: signal(true),
    }

    const state = new EscalateWriteStep(installStore).state()

    expect(state).toBe(installStore.escalateWrite)
  })
})
