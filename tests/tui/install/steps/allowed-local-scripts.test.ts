import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import { emptyText } from '../../../../src/tui/input-text.ts'
import { AllowedLocalScriptsStep } from '../../../../src/tui/install/steps/allowed-local-scripts.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('AllowedLocalScriptsStep', () => {
  it('when finished, moves on to the provider name', () => {
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
      step: signal<InstallStep>('allowedLocalScripts'),
      confirmation: signal(true),
    }

    const step = new AllowedLocalScriptsStep(installStore)

    expect(step.nextStep).toBe('providerName')
  })
})
