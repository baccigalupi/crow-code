import { describe, expect, it, spyOn } from 'bun:test'
import { signal } from '@preact/signals-core'
import { runInstallTui } from '../../../src/tui/install/runner.ts'
import { installStore } from '../../../src/tui/install/interactions/state/config-text.ts'
import { emptyText, insertText } from '../../../src/tui/input-text.ts'
import type { InstallStep } from '../../../src/tui/install/types.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

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
    const store = {
      repoDirectory: signal(insertText(emptyText(), '/repo/injected')),
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
      step: signal<InstallStep>('confirm'),
      confirmation: signal(true),
    }

    runInstallTui(applicationData, {}, store)
    store.step.value = 'write'

    expect(mkdir.mock.calls).toEqual([['/repo/injected']])
  })
})
