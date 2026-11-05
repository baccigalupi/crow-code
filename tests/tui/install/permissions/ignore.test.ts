import { describe, expect, it } from 'bun:test'
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

  it('when asked for its field, is the ignore list', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const field = new IgnorePanel().field(store)

    expect(field).toBe(store.permissions.ignore)
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
