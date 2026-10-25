import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import { emptyText } from '../../../../src/tui/input-text.ts'
import { ProviderUrlStep } from '../../../../src/tui/install/steps/provider-url.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('ProviderUrlStep', () => {
  it('when asked for its state, returns the provider url input', () => {
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
      step: signal<InstallStep>('providerUrl'),
      confirmation: signal(true),
    }

    const step = new ProviderUrlStep(installStore)

    expect(step.name).toBe('providerUrl')
    expect(step.nextStep).toBe('providerCredentials')
    expect(step.state()).toBe(installStore.providerUrl)
  })

  it('when focused forward, moves to the credentials step', () => {
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
      step: signal<InstallStep>('providerUrl'),
      confirmation: signal(true),
    }

    new ProviderUrlStep(installStore).focus(1)

    expect(installStore.step.peek()).toBe('providerCredentials')
  })

  it('when cancelled, leaves the provider loop for confirm', () => {
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
      step: signal<InstallStep>('providerUrl'),
      confirmation: signal(true),
    }

    new ProviderUrlStep(installStore).cancel()

    expect(installStore.step.peek()).toBe('confirm')
  })
})
