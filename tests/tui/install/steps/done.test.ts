import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { signal } from '@preact/signals-core'
import { emptyBuffer } from '../../../../src/tui/input-buffer.ts'
import { DoneStep } from '../../../../src/tui/install/steps/done.ts'
import { DoneMessage } from '../../../../src/tui/install/views/steps/done-message.tsx'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('DoneStep', () => {
  it('when asked for the next step, returns done', () => {
    const installStore = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('done'),
      confirmation: signal(true),
    }

    const step = new DoneStep(installStore)

    expect(step.nextStep).toBe('done')
  })

  it('when asked for its view, returns the done message', () => {
    const installStore = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('done'),
      confirmation: signal(true),
    }

    const step = new DoneStep(installStore)

    expect(step.View).toBe(DoneMessage)
  })

  it('when asked for its state, returns the env file input', () => {
    const installStore = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('done'),
      confirmation: signal(true),
    }

    const state = new DoneStep(installStore).state()

    expect(state).toBe(installStore.envFile)
  })
})
