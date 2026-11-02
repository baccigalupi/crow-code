import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { AdditionalWritePanel } from '../../../../src/tui/install/panels/additional-write.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('AdditionalWritePanel', () => {
  it('when asked, names itself and the panel that comes next', () => {
    const panel = new AdditionalWritePanel()

    const { name } = panel

    expect(name).toBe('additionalWrite')
    expect(panel.next).toBe('escalateRead')
  })

  it('when a key is typed, its controller edits the additional write list', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new AdditionalWritePanel().controller(store)

    controller.handle(new Keypress('x', {}))

    expect(store.permissions.additionalWrite.text.peek().text).toBe('x')
  })

  it('when nothing is typed, its view model shows the question and a bare default', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new AdditionalWritePanel().viewModel(store)

    const props = viewModel.props(store.stepValues.peek())

    expect(props.label).toBe('Additional write directories')
    expect(props.defaultValue).toBe(store.permissions.defaultAdditionalWrite)
    expect(props.bare).toBe(true)
  })
})
