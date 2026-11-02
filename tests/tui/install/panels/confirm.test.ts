import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { ConfirmPanel } from '../../../../src/tui/install/panels/confirm.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ConfirmPanel', () => {
  it('when asked, names itself and the panel that comes next', () => {
    const panel = new ConfirmPanel()

    const { name } = panel

    expect(name).toBe('confirm')
    expect(panel.next).toBe('completeSetup')
    expect(panel.cancel).toBeUndefined()
  })

  it('when return is pressed after choosing yes, its controller moves on', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new ConfirmPanel().controller(store)
    controller.handle(new Keypress('y', {}))

    const outcome = controller.handle(new Keypress('', { return: true }))

    expect(outcome).toBe('next')
  })

  it('when return is pressed after choosing no, its controller exits', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new ConfirmPanel().controller(store)
    controller.handle(new Keypress('n', {}))

    const outcome = controller.handle(new Keypress('', { return: true }))

    expect(outcome).toBe('exit')
  })

  it('when asked for its view model, selects the option the store has chosen', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const props = new ConfirmPanel().props(store)

    expect(props).toEqual({ selectedIndex: 0 })
  })
})
