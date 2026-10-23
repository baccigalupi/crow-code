import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import { emptyText } from '../../../../src/opentui/input-text.ts'
import { CrowGlobalDirectoryStep } from '../../../../src/opentui/install/steps/crow-global-directory.ts'
import type { InstallStep } from '../../../../src/opentui/install/types.ts'

describe('CrowGlobalDirectoryStep', () => {
  it('when asked for its state, returns the global directory input', () => {
    const installStore = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      additionalRead: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('crowGlobalDirectory'),
      confirmation: signal(true),
    }

    const state = new CrowGlobalDirectoryStep(installStore).state()

    expect(state).toBe(installStore.globalDirectory)
  })
})
