import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { IgnorePanel } from '../../../../src/tui/install/permissions/ignore.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('IgnorePanel', () => {
  it('when asked, names itself and the panel that comes next', () => {
    const panel = new IgnorePanel()

    const { name } = panel

    expect(name).toBe('ignore')
    expect(panel.next).toBe('additionalRead')
  })

  it('when a key is typed, its controller edits the ignore list', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new IgnorePanel().controller(store)

    controller.handle(new Keypress('x', {}))

    expect(store.permissions.ignore.text.peek().text).toBe('x')
  })

  it('when nothing is typed, it shows the question and a bare default', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const panel = new IgnorePanel()

    const defaultValue = panel.defaultValue(store)

    expect(panel.label).toBe('Ignored paths')
    expect(defaultValue).toBe(store.permissions.defaultIgnore)
    expect(panel.bare).toBe(true)
  })
})
