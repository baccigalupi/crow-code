import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
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

  it('when a key is typed, its controller edits the global directory', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new CrowGlobalDirectoryPanel().controller(store)

    controller.handle(new Keypress('x', {}))

    expect(store.directories.globalDirectory.text.peek().text).toBe('x')
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
