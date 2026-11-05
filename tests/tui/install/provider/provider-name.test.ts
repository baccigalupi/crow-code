import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { ProviderNamePanel } from '../../../../src/tui/install/provider/provider-name.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ProviderNamePanel', () => {
  it('when asked, names itself and its flow', () => {
    const panel = new ProviderNamePanel()

    const { name } = panel

    expect(name).toBe('providerName')
    expect(panel.next).toBe('providerUrl')
    expect(panel.cancel).toBe('confirm')
  })

  it('when asked for its field, is the provider name', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const field = new ProviderNamePanel().field(store)

    expect(field).toBe(store.providerEditForm.providerName)
  })

  it('when asked where tab leads, goes forward to the url and nowhere back', () => {
    const panel = new ProviderNamePanel()

    const { forward, back } = panel

    expect(forward).toBe('providerUrl')
    expect(back).toBeUndefined()
  })

  it('when asked for its prompt, renders the provider block', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.navigator.goTo('providerName')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      new ProviderNamePanel().prompt(store),

      { width: 70, height: 8 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Provider 1')
    act(() => renderer.destroy())
  })
})
