import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { EscalateReadPanel } from '../../../../src/tui/install/permissions/escalate-read.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('EscalateReadPanel', () => {
  it('when asked, names itself and the panel that comes next', () => {
    const panel = new EscalateReadPanel()

    const { name } = panel

    expect(name).toBe('escalateRead')
    expect(panel.next).toBe('escalateWrite')
  })

  it('when a key is typed, its controller edits the escalate read list', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new EscalateReadPanel().controller(store)

    controller.handle(new Keypress('x', {}))

    expect(store.permissions.escalateRead.text.peek().text).toBe('x')
  })

  it('when nothing is typed, it shows the question and a bare default', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const panel = new EscalateReadPanel()

    const defaultValue = panel.defaultValue(store)

    expect(panel.label).toBe('Escalate read directories')
    expect(defaultValue).toBe(store.permissions.defaultEscalateRead)
    expect(panel.bare).toBe(true)
  })
})
