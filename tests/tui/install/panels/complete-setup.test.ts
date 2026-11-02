import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { CompleteSetupPanel } from '../../../../src/tui/install/panels/complete-setup.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('CompleteSetupPanel', () => {
  it('when asked, names itself and has nowhere to go next', () => {
    const panel = new CompleteSetupPanel()

    const { name } = panel

    expect(name).toBe('completeSetup')
    expect(panel.next).toBeUndefined()
    expect(panel.cancel).toBeUndefined()
  })

  it('when any key is pressed, its controller stays', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new CompleteSetupPanel().controller(store)

    const outcome = controller.handle(new Keypress('x', {}))

    expect(outcome).toBe('stay')
  })

  it('when no setup task has run, its view model has no rows', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new CompleteSetupPanel().viewModel(store)

    const props = viewModel.props({
      ...store.stepValues.peek(),
      setupTasks: [],
    })

    expect(props).toEqual({ rows: [] })
  })
})
