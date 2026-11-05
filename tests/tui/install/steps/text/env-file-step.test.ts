import { describe, expect, it } from 'bun:test'
import { DataStore } from '../../../../../src/tui/install/data-store.ts'
import { EnvFileStep } from '../../../../../src/tui/install/steps/text/env-file-step.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('EnvFileStep', () => {
  it('when asked for its name, is envFile', () => {
    const step = new EnvFileStep()

    const name = step.name

    expect(name).toBe('envFile')
  })

  it('when asked for its label, asks for the credentials file', () => {
    const step = new EnvFileStep()

    const label = step.label

    expect(label).toBe('Credentials .env file')
  })

  it('when finished, goes to the ignored paths', () => {
    const step = new EnvFileStep()

    const next = step.next

    expect(next).toBe('ignore')
  })

  it('when the global directory is typed, its default is the .env file inside it', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.directories.globalDirectory.replace('/opt/crow')
    const step = new EnvFileStep()

    const defaultValue = step.defaultValue(store)

    expect(defaultValue).toBe('/opt/crow/.env')
  })
})
