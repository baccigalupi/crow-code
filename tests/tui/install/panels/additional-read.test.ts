import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { AdditionalReadPanel } from '../../../../src/tui/install/panels/additional-read.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('AdditionalReadPanel', () => {
  it('when asked, names itself and the panel that comes next', () => {
    const panel = new AdditionalReadPanel()

    const { name } = panel

    expect(name).toBe('additionalRead')
    expect(panel.next).toBe('additionalWrite')
  })

  it('when a key is typed, its controller edits the additional read list', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new AdditionalReadPanel().controller(store)

    controller.handle(new Keypress('x', {}))

    expect(store.permissions.additionalRead.text.peek().text).toBe('x')
  })

  it('when nothing is typed, it shows the question and a bare default', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const panel = new AdditionalReadPanel()

    const defaultValue = panel.defaultValue(store)

    expect(panel.label).toBe('Additional read directories')
    expect(defaultValue).toBe(store.permissions.defaultAdditionalRead)
    expect(panel.bare).toBe(true)
  })
})
