import { describe, expect, it, spyOn } from 'bun:test'
import { runInstallTui } from '../../../src/tui/install/runner.ts'
import { installStore } from '../../../src/tui/install/interactions/state/config-text.ts'
import { emptyText, insertText } from '../../../src/tui/input-text.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { buildInstallStore } from '../../support/install-store.ts'

describe('runInstallTui', () => {
  it('when no store is given, starts setup from the shared install data', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    installStore.repoDirectory.value = insertText(emptyText(), '/repo/shared')

    runInstallTui(applicationData, {})
    installStore.step.value = 'completeSetup'
    installStore.step.value = 'repo'
    installStore.repoDirectory.value = emptyText()

    expect(mkdir.mock.calls).toEqual([['/repo/shared']])
  })

  it('when a store is given, starts setup from that store', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const store = buildInstallStore()
    store.repoDirectory.value = insertText(emptyText(), '/repo/injected')
    store.step.value = 'confirm'

    runInstallTui(applicationData, {}, store)
    store.step.value = 'completeSetup'

    expect(mkdir.mock.calls).toEqual([['/repo/injected']])
  })
})
