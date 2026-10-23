import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import { emptyText } from '../../../../src/tui/input-text.ts'
import { DefaultStep } from '../../../../src/tui/install/steps/default.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('DefaultStep', () => {
  it('when asked for the next step, returns confirm', () => {
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
      step: signal<InstallStep>('write'),
      confirmation: signal(true),
    }

    const step = new DefaultStep(installStore)

    expect(step.nextStep).toBe('confirm')
  })

  it('when asked for its view, renders nothing', () => {
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
      step: signal<InstallStep>('write'),
      confirmation: signal(true),
    }

    const rendered = new DefaultStep(installStore).View()

    expect(rendered).toBeNull()
  })

  it('when asked for its state, returns the env file input', () => {
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
      step: signal<InstallStep>('write'),
      confirmation: signal(true),
    }

    const state = new DefaultStep(installStore).state()

    expect(state).toBe(installStore.envFile)
  })
})
