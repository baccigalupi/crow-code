import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { EscalateWritePanel } from '../../../../src/tui/install/panels/escalate-write.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('EscalateWritePanel', () => {
  it('when asked, names itself and the panel that comes next', () => {
    const panel = new EscalateWritePanel()

    const { name } = panel

    expect(name).toBe('escalateWrite')
    expect(panel.next).toBe('allowedLocalScripts')
  })

  it('when a key is typed, its controller edits the escalate write list', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new EscalateWritePanel().controller(store)

    controller.handle(new Keypress('x', {}))

    expect(store.permissions.escalateWrite.text.peek().text).toBe('x')
  })

  it('when nothing is typed, its view model shows the question and a parenthesised default', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new EscalateWritePanel().viewModel(store)

    const props = viewModel.props(store.stepValues.peek())

    expect(props.label).toBe('Escalate write directories')
    expect(props.defaultValue).toBe(store.permissions.defaultEscalateWrite)
    expect(props.bare).toBe(false)
  })
})
