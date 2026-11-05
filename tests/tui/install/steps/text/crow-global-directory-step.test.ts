import { describe, expect, it } from 'bun:test'
import { DataStore } from '../../../../../src/tui/install/data-store.ts'
import { CrowGlobalDirectoryStep } from '../../../../../src/tui/install/steps/text/crow-global-directory-step.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('CrowGlobalDirectoryStep', () => {
  it('when asked for its name, is crowGlobalDirectory', () => {
    const step = new CrowGlobalDirectoryStep()

    const name = step.name

    expect(name).toBe('crowGlobalDirectory')
  })

  it('when asked for its label, asks for the user crow directory', () => {
    const step = new CrowGlobalDirectoryStep()

    const label = step.label

    expect(label).toBe('User crow directory')
  })

  it('when finished, goes to the env file', () => {
    const step = new CrowGlobalDirectoryStep()

    const next = step.next

    expect(next).toBe('envFile')
  })

  it('when asked for its default, is the default global directory', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const step = new CrowGlobalDirectoryStep()

    const defaultValue = step.defaultValue(store)

    expect(defaultValue).toBe('~/.crow')
  })
})
