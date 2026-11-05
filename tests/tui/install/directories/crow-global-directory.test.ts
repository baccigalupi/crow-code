import { describe, expect, it } from 'bun:test'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { CrowGlobalDirectoryPanel } from '../../../../src/tui/install/directories/crow-global-directory.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('CrowGlobalDirectoryPanel', () => {
  it('when asked, names itself and the panel that comes next', () => {
    const panel = new CrowGlobalDirectoryPanel()

    const { name } = panel

    expect(name).toBe('crowGlobalDirectory')
    expect(panel.next).toBe('envFile')
  })

  it('when asked for its field, is the global directory', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const field = new CrowGlobalDirectoryPanel().field(store)

    expect(field).toBe(store.directories.globalDirectory)
  })

  it('when nothing is typed, it shows the question and the default', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const panel = new CrowGlobalDirectoryPanel()

    const defaultValue = panel.defaultValue(store)

    expect(panel.label).toBe('User crow directory')
    expect(defaultValue).toBe('~/.crow')
    expect(panel.bare).toBe(false)
  })
})
