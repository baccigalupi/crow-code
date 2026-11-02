import { describe, expect, it, mock } from 'bun:test'
import { Keypress } from '../../../src/tui/keypress.ts'
import { Subscriptions } from '../../../src/tui/install/subscriptions.ts'
import { DataStore } from '../../../src/tui/install/data-store.ts'
import { Panels } from '../../../src/tui/install/panels.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('Subscriptions', () => {
  it('when listening, draws the preview and the prompt once from the store', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const layout = { drawPreview: mock(), drawPrompt: mock() }
    const subscriptions = new Subscriptions(model, layout, new Panels())

    subscriptions.listen()

    expect(layout.drawPreview).toHaveBeenCalledTimes(1)
    expect(layout.drawPrompt).toHaveBeenCalledTimes(1)
  })

  it('when listening, draws the prompt of the current panel', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const layout = { drawPreview: mock(), drawPrompt: mock() }
    const subscriptions = new Subscriptions(model, layout, new Panels())

    subscriptions.listen()

    expect(layout.drawPrompt.mock.calls[0][0]).toBe('repo')
  })

  it('when listening, hides the config preview on the first step', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const layout = { drawPreview: mock(), drawPrompt: mock() }
    const subscriptions = new Subscriptions(model, layout, new Panels())

    subscriptions.listen()

    expect(layout.drawPreview.mock.calls[0][0].visible).toBe(false)
  })

  it('when a key edits the store, redraws the prompt with the new value', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const layout = { drawPreview: mock(), drawPrompt: mock() }
    const subscriptions = new Subscriptions(model, layout, new Panels())
    subscriptions.listen()

    model.navigator.press(new Keypress('x', {}), mock())

    expect(layout.drawPrompt.mock.calls[1][1].input.text).toBe('x')
  })

  it('when disposed, stops redrawing', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const layout = { drawPreview: mock(), drawPrompt: mock() }
    const subscriptions = new Subscriptions(model, layout, new Panels())
    subscriptions.listen()

    subscriptions.dispose()
    model.navigator.press(new Keypress('y', {}), mock())

    expect(layout.drawPrompt).toHaveBeenCalledTimes(1)
  })
})
