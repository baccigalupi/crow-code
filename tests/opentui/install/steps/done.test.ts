import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import { emptyText } from '../../../../src/opentui/input-text.ts'
import { DoneStep } from '../../../../src/opentui/install/steps/done.ts'
import { DoneMessage } from '../../../../src/opentui/install/views/steps/done-message.tsx'
import type { InstallStep } from '../../../../src/opentui/install/types.ts'

describe('DoneStep', () => {
  it('when asked for the next step, returns done', () => {
    const installStore = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      additionalRead: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('done'),
      confirmation: signal(true),
    }

    const step = new DoneStep(installStore)

    expect(step.nextStep).toBe('done')
  })

  it('when asked for its view, returns the done message', () => {
    const installStore = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      additionalRead: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('done'),
      confirmation: signal(true),
    }

    const step = new DoneStep(installStore)

    expect(step.View).toBe(DoneMessage)
  })

  it('when asked for its state, returns the env file input', () => {
    const installStore = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      additionalRead: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('done'),
      confirmation: signal(true),
    }

    const state = new DoneStep(installStore).state()

    expect(state).toBe(installStore.envFile)
  })
})
