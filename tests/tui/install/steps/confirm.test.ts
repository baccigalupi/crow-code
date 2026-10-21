import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { signal } from '@preact/signals-core'
import { emptyBuffer } from '../../../../src/tui/input-buffer.ts'
import { ConfirmStep } from '../../../../src/tui/install/steps/confirm.ts'
import { ConfirmPrompt } from '../../../../src/tui/install/views/steps/confirm-prompt.tsx'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('ConfirmStep', () => {
  it('when asked for the next step, returns write', () => {
    const installState = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('confirm'),
      confirmation: signal(true),
    }

    const step = new ConfirmStep(installState)

    expect(step.nextStep).toBe('write')
  })

  it('when asked for its view, returns the confirm prompt', () => {
    const installState = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('confirm'),
      confirmation: signal(true),
    }

    const step = new ConfirmStep(installState)

    expect(step.View).toBe(ConfirmPrompt)
  })

  it('when asked for its state, returns the env file input', () => {
    const installState = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('confirm'),
      confirmation: signal(true),
    }

    const state = new ConfirmStep(installState).state()

    expect(state).toBe(installState.envFile)
  })
})
