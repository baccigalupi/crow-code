import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import { emptyText } from '../../../../src/tui/input-text.ts'
import { ProviderCredentialsStep } from '../../../../src/tui/install/steps/provider-credentials.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('ProviderCredentialsStep', () => {
  it('when asked for its state, returns the provider credentials input', () => {
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
      providerName: signal(emptyText()),
      providerUrl: signal(emptyText()),
      providerCredentials: signal(emptyText()),
      providers: signal([]),
      envBuffer: signal({}),
      step: signal<InstallStep>('providerCredentials'),
      confirmation: signal(true),
    }

    const step = new ProviderCredentialsStep(installStore)

    expect(step.name).toBe('providerCredentials')
    expect(step.nextStep).toBe('providerName')
    expect(step.state()).toBe(installStore.providerCredentials)
  })

  it('when cancelled, drops the typed credential and moves to confirm', () => {
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
      providerName: signal({ text: 'nous', cursor: 4 }),
      providerUrl: signal({ text: 'https://n', cursor: 9 }),
      providerCredentials: signal({ text: 'sk-1', cursor: 4 }),
      providers: signal([]),
      envBuffer: signal({}),
      step: signal<InstallStep>('providerCredentials'),
      confirmation: signal(true),
    }
    const step = new ProviderCredentialsStep(installStore)

    step.cancel()

    expect(installStore.step.peek()).toBe('confirm')
    expect(installStore.providerCredentials.peek()).toEqual({
      text: '',
      cursor: 0,
    })
    expect(installStore.envBuffer.peek()).toEqual({})
  })
})
