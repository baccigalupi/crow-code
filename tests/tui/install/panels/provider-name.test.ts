import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { ProviderNamePanel } from '../../../../src/tui/install/panels/provider-name.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ProviderNamePanel', () => {
  it('when asked, names itself, its flow and the config line it edits', () => {
    const panel = new ProviderNamePanel()

    const { name } = panel

    expect(name).toBe('providerName')
    expect(panel.next).toBe('providerUrl')
    expect(panel.cancel).toBe('confirm')
    expect(panel.highlights).toEqual({ key: 'name', occurrence: 'last' })
  })

  it('when a key is typed, its controller edits the provider name', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new ProviderNamePanel().controller(store)

    controller.handle(new Keypress('x', {}))

    expect(store.providers.providerName.text.peek().text).toBe('x')
  })

  it('when tab is pressed, its controller goes to the url field', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new ProviderNamePanel().controller(store)

    const outcome = controller.handle(new Keypress('', { tab: true }))

    expect(outcome).toEqual({ goTo: 'providerUrl' })
  })

  it('when shift-tab is pressed, its controller stays, there being no field before', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new ProviderNamePanel().controller(store)

    const outcome = controller.handle(
      new Keypress('', { tab: true, shift: true }),
    )

    expect(outcome).toBe('stay')
  })

  it('when asked for its view model, shows the first field as the active one', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.navigator.goTo('providerName')
    const viewModel = new ProviderNamePanel().viewModel(store)

    const props = viewModel.props(store.stepValues.peek())

    expect(props.title).toBe('Provider 1')
  })
})
