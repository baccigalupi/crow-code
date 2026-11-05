import { describe, expect, it } from 'bun:test'
import { DataStore } from '../../../../../src/tui/install/data-store.ts'
import { RepoDirectoryStep } from '../../../../../src/tui/install/steps/text/repo-directory-step.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('RepoDirectoryStep', () => {
  it('when asked for its name, is repoDirectory', () => {
    const step = new RepoDirectoryStep()

    const name = step.name

    expect(name).toBe('repoDirectory')
  })

  it('when asked for its label, asks for the local repo directory', () => {
    const step = new RepoDirectoryStep()

    const label = step.label

    expect(label).toBe('What directory for the local repo crow setup')
  })

  it('when finished, goes to the global directory', () => {
    const step = new RepoDirectoryStep()

    const next = step.next

    expect(next).toBe('crowGlobalDirectory')
  })

  it('when asked for its default, is the default repo directory', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const step = new RepoDirectoryStep()

    const defaultValue = step.defaultValue(store)

    expect(defaultValue).toBe('.crow')
  })
})
