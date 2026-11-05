import { describe, expect, it } from 'bun:test'
import { TextAttributes } from '@opentui/core'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { ProviderPrompt } from '../../../../src/tui/install/provider/provider-prompt.tsx'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ProviderPrompt', () => {
  it('when a provider is saved, the title counts the next one', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.navigator.goTo('providerName')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <ProviderPrompt step="providerName" store={store} />,
      { width: 70, height: 10 },
    )

    act(() => store.providers.save({ name: 'a', url: 'u' }, ''))
    await renderOnce()

    expect(captureCharFrame()).toContain('Provider 2')
    act(() => renderer.destroy())
  })

  it('when on the name, the name is live and the later fields are dim labels', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.navigator.goTo('providerName')
    const { renderer, renderOnce, captureCharFrame, captureSpans } =
      await testRender(<ProviderPrompt step="providerName" store={store} />, {
        width: 70,
        height: 10,
      })

    await renderOnce()

    const { lines } = captureSpans()
    expect(captureCharFrame()).toContain('Provider 1')
    expect(lines[1].spans[0].text).toContain('│ Name: ')
    expect(lines[2].spans[1].text).toBe('Url:')
    expect(lines[2].spans[1].attributes).toBe(TextAttributes.DIM)
    expect(lines[3].spans[1].text).toBe('API key:')
    expect(lines[3].spans[1].attributes).toBe(TextAttributes.DIM)
    expect(lines[5].spans[1].text).toBe('Esc to finish adding providers')
    expect(lines[5].spans[1].attributes).toBe(TextAttributes.DIM)
    act(() => renderer.destroy())
  })
})
