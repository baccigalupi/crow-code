import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import { emptyText } from '../../../../src/tui/input-text.ts'
import { ConfirmStep } from '../../../../src/tui/install/steps/confirm.ts'
import { ConfirmPrompt } from '../../../../src/tui/install/views/steps/confirm-prompt.tsx'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('ConfirmStep', () => {
  it('when asked for the next step, returns write', () => {
    const installStore = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      additionalRead: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('confirm'),
      confirmation: signal(true),
    }

    const step = new ConfirmStep(installStore)

    expect(step.nextStep).toBe('write')
  })

  it('when asked for its view, returns the confirm prompt', () => {
    const installStore = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      additionalRead: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('confirm'),
      confirmation: signal(true),
    }

    const step = new ConfirmStep(installStore)

    expect(step.View).toBe(ConfirmPrompt)
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
      step: signal<InstallStep>('confirm'),
      confirmation: signal(true),
    }

    const state = new ConfirmStep(installStore).state()

    expect(state).toBe(installStore.envFile)
  })
})
