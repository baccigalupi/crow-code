import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { IgnorePanel } from '../../../../src/tui/install/panels/ignore.ts'
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

  it('when nothing is typed, its view model shows the question and a bare default', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new IgnorePanel().viewModel(store)

    const props = viewModel.props(store.stepValues.peek())

    expect(props.label).toBe('Ignored paths')
    expect(props.defaultValue).toBe(store.permissions.defaultIgnore)
    expect(props.bare).toBe(true)
  })
})
