import { describe, expect, it, spyOn } from 'bun:test'
import {
  InstallTuiRunner,
  runInstallTui,
} from '../../../src/tui/install/runner.ts'
import { InstallApp } from '../../../src/tui/install/views/install-app.tsx'
import { userInputStore } from '../../../src/tui/install/interactions/state/config-text.ts'
import { emptyText, insertText } from '../../../src/tui/input-text.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { buildUserInputStore } from '../../support/user-input-store.ts'

describe('runner', () => {
  it('when asked for its view, builds the install app with the store and the setup task states', () => {
    const store = buildUserInputStore()

    const view = new InstallTuiRunner(mockApplicationData(), {}, store).view()

    expect(view.type).toBe(InstallApp)
    expect(view.props.userInputStore).toBe(store)
    expect(view.props.taskStates).toHaveLength(2)
  })

  it('when no store is given, starts setup from the shared install data', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    userInputStore.repoDirectory.value = insertText(emptyText(), '/repo/shared')

    runInstallTui(applicationData, {})
    userInputStore.step.value = 'completeSetup'
    userInputStore.step.value = 'repo'
    userInputStore.repoDirectory.value = emptyText()

    expect(mkdir.mock.calls).toEqual([['/repo/shared']])
  })

  it('when a store is given, starts setup from that store', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const store = buildUserInputStore()
    store.repoDirectory.value = insertText(emptyText(), '/repo/injected')
    store.step.value = 'confirm'

    runInstallTui(applicationData, {}, store)
    store.step.value = 'completeSetup'

    expect(mkdir.mock.calls).toEqual([['/repo/injected']])
  })
})
