import { describe, expect, it, mock } from 'bun:test'
import { Subscriptions } from '../../../src/tui/install/subscriptions.ts'
import { DataStore } from '../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('Subscriptions', () => {
  it('when listening, draws both views once from the store', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const screen = {
      configPanel: { update: mock() },
      stepPrompts: { update: mock() },
    }
    const subscriptions = new Subscriptions(model, screen)

    subscriptions.listen()

    expect(screen.configPanel.update).toHaveBeenCalledTimes(1)
    expect(screen.stepPrompts.update).toHaveBeenCalledTimes(1)
  })

  it('when a key edits the store, redraws the step prompts with the new value', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const screen = {
      configPanel: { update: mock() },
      stepPrompts: { update: mock() },
    }
    const subscriptions = new Subscriptions(model, screen)
    subscriptions.listen()

    model.press('x', {}, mock())

    expect(screen.stepPrompts.update.mock.calls[1][0].repoDirectory.text).toBe(
      'x',
    )
  })

  it('when disposed, stops redrawing', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const screen = {
      configPanel: { update: mock() },
      stepPrompts: { update: mock() },
    }
    const subscriptions = new Subscriptions(model, screen)
    subscriptions.listen()

    subscriptions.dispose()
    model.press('y', {}, mock())

    expect(screen.stepPrompts.update).toHaveBeenCalledTimes(1)
  })
})
