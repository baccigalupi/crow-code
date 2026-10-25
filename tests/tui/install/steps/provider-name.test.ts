import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import { emptyText } from '../../../../src/tui/input-text.ts'
import { ProviderNameStep } from '../../../../src/tui/install/steps/provider-name.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('ProviderNameStep', () => {
  it('when asked for its state, returns the provider name input', () => {
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
      step: signal<InstallStep>('providerName'),
      confirmation: signal(true),
    }

    const step = new ProviderNameStep(installStore)

    expect(step.name).toBe('providerName')
    expect(step.nextStep).toBe('providerUrl')
    expect(step.state()).toBe(installStore.providerName)
  })
})
