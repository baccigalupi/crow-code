import { describe, expect, it } from 'bun:test'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { EnvFilePanel } from '../../../../src/tui/install/directories/env-file.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('EnvFilePanel', () => {
  it('when asked, names itself and the panel that comes next', () => {
    const panel = new EnvFilePanel()

    const { name } = panel

    expect(name).toBe('envFile')
    expect(panel.next).toBe('ignore')
  })

  it('when asked for its field, is the env file', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const field = new EnvFilePanel().field(store)

    expect(field).toBe(store.directories.envFile)
  })

  it('when nothing is typed, it defaults to .env inside the global directory', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.directories.globalDirectory.insert('/g')
    const panel = new EnvFilePanel()

    const defaultValue = panel.defaultValue(store)

    expect(panel.label).toBe('Credentials .env file')
    expect(defaultValue).toBe('/g/.env')
    expect(panel.bare).toBe(false)
  })
})
