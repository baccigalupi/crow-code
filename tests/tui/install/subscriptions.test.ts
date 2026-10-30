import { describe, expect, it, mock } from 'bun:test'
import { Keypress } from '../../../src/tui/keypress.ts'
import { Subscriptions } from '../../../src/tui/install/subscriptions.ts'
import { DataStore } from '../../../src/tui/install/data-store.ts'
import { InstallViewModels } from '../../../src/tui/install/view-models/install-view-models.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('Subscriptions', () => {
  it('when listening, draws both views once from the store', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const screen = {
      configPanel: { update: mock() },
      stepPrompts: { update: mock() },
    }
    const subscriptions = new Subscriptions(
      model,
      screen,
      new InstallViewModels(model),
    )

    subscriptions.listen()

    expect(screen.configPanel.update).toHaveBeenCalledTimes(1)
    expect(screen.stepPrompts.update).toHaveBeenCalledTimes(1)
  })

  it('when listening, hides the config panel on the first step', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const screen = {
      configPanel: { update: mock() },
      stepPrompts: { update: mock() },
    }
    const subscriptions = new Subscriptions(
      model,
      screen,
      new InstallViewModels(model),
    )

    subscriptions.listen()

    expect(screen.configPanel.update.mock.calls[0][0].visible).toBe(false)
  })

  it('when a key edits the store, redraws the step prompts with the new value', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const screen = {
      configPanel: { update: mock() },
      stepPrompts: { update: mock() },
    }
    const subscriptions = new Subscriptions(
      model,
      screen,
      new InstallViewModels(model),
    )
    subscriptions.listen()

    model.navigator.press(new Keypress('x', {}), mock())

    expect(screen.stepPrompts.update.mock.calls[1][0].props.input.text).toBe(
      'x',
    )
  })

  it('when disposed, stops redrawing', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const screen = {
      configPanel: { update: mock() },
      stepPrompts: { update: mock() },
    }
    const subscriptions = new Subscriptions(
      model,
      screen,
      new InstallViewModels(model),
    )
    subscriptions.listen()

    subscriptions.dispose()
    model.navigator.press(new Keypress('y', {}), mock())

    expect(screen.stepPrompts.update).toHaveBeenCalledTimes(1)
  })
})
