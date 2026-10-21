import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { signal } from '@preact/signals-core'
import { emptyBuffer } from '../../../../src/tui/input-buffer.ts'
import { DefaultStep } from '../../../../src/tui/install/steps/default.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('DefaultStep', () => {
  it('when asked for the next step, returns confirm', () => {
    const installState = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('write'),
      confirmation: signal(true),
    }

    const step = new DefaultStep(installState)

    expect(step.nextStep).toBe('confirm')
  })

  it('when asked for its view, renders nothing', () => {
    const installState = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('write'),
      confirmation: signal(true),
    }

    const rendered = new DefaultStep(installState).View()

    expect(rendered).toBeNull()
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
      step: signal<InstallStep>('write'),
      confirmation: signal(true),
    }

    const state = new DefaultStep(installState).state()

    expect(state).toBe(installState.envFile)
  })
})
