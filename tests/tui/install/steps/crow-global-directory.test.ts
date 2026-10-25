import { describe, expect, it } from 'bun:test'
import { CrowGlobalDirectoryStep } from '../../../../src/tui/install/steps/crow-global-directory.ts'
import { buildInstallStore } from '../../../support/install-store.ts'

describe('CrowGlobalDirectoryStep', () => {
  it('when asked for its state, returns the global directory input', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'crowGlobalDirectory'

    const state = new CrowGlobalDirectoryStep(installStore).state()

    expect(state).toBe(installStore.globalDirectory)
  })
})
