import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import { emptyText } from '../../../../src/tui/input-text.ts'
import { AdditionalWriteStep } from '../../../../src/tui/install/steps/additional-write.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('AdditionalWriteStep', () => {
  it('when asked for its state, returns the additional write input', () => {
    const installStore = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      ignore: signal(emptyText()),
      additionalRead: signal(emptyText()),
      additionalWrite: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('additionalWrite'),
      confirmation: signal(true),
    }

    const step = new AdditionalWriteStep(installStore)

    expect(step.name).toBe('additionalWrite')
    expect(step.nextStep).toBe('escalateRead')
    expect(step.state()).toBe(installStore.additionalWrite)
  })
})
