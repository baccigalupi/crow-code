import { describe, expect, it, spyOn } from 'bun:test'
import { runInstallTui } from '../../../src/tui/install/runner.ts'
import { installStore } from '../../../src/tui/install/interactions/state/config-text.ts'
import { emptyText, insertText } from '../../../src/tui/input-text.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { buildInstallStore } from '../../support/install-store.ts'

describe('runInstallTui', () => {
  it('when no store is given, writes the shared install data', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockResolvedValue()
    spyOn(applicationData.filesystem, 'writeTextFile').mockResolvedValue()
    installStore.repoDirectory.value = insertText(emptyText(), '/repo/shared')

    runInstallTui(applicationData, {})
    installStore.step.value = 'write'
    installStore.step.value = 'repo'
    installStore.repoDirectory.value = emptyText()

    expect(mkdir.mock.calls).toEqual([['/repo/shared']])
  })

  it('when a store is given, writes that store install data', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockResolvedValue()
    spyOn(applicationData.filesystem, 'writeTextFile').mockResolvedValue()
    const store = buildInstallStore()
    store.repoDirectory.value = insertText(emptyText(), '/repo/injected')
    store.step.value = 'confirm'

    runInstallTui(applicationData, {}, store)
    store.step.value = 'write'

    expect(mkdir.mock.calls).toEqual([['/repo/injected']])
  })
})
