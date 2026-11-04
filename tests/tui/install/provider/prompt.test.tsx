import { describe, expect, it } from 'bun:test'
import { TextAttributes } from '@opentui/core'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { ProviderPrompt } from '../../../../src/tui/install/provider/prompt.tsx'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ProviderPrompt', () => {
  it('when a provider is saved, the title counts the next one', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.navigator.goTo('providerName')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <ProviderPrompt model={model} />,
      { width: 70, height: 10 },
    )

    act(() => model.providers.save({ name: 'a', url: 'u' }, ''))
    await renderOnce()

    expect(captureCharFrame()).toContain('Provider 2')
    act(() => renderer.destroy())
  })

  it('when on the name, the name is live and the later fields are dim labels', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.navigator.goTo('providerName')
    const { renderer, renderOnce, captureCharFrame, captureSpans } =
      await testRender(<ProviderPrompt model={model} />, {
        width: 70,
        height: 10,
      })

    await renderOnce()

    const { lines } = captureSpans()
    expect(captureCharFrame()).toContain('Provider 1')
    expect(lines[1].spans[0].text).toBe('│ Name: ')
    expect(lines[1].spans[1].text).toBe(' ')
    expect(lines[1].spans[1].attributes).toBe(TextAttributes.INVERSE)
    expect(lines[2].spans[1].text).toBe('Url:')
    expect(lines[2].spans[1].attributes).toBe(TextAttributes.DIM)
    expect(lines[3].spans[1].text).toBe('API key:')
    expect(lines[3].spans[1].attributes).toBe(TextAttributes.DIM)
    expect(lines[5].spans[1].text).toBe('Esc to finish adding providers')
    expect(lines[5].spans[1].attributes).toBe(TextAttributes.DIM)
    act(() => renderer.destroy())
  })

  it('when on the API key, earlier fields show their values and the key is masked', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.providerEditForm.providerName.insert('nous')
    model.providerEditForm.providerUrl.insert('https://n')
    model.providerEditForm.providerCredentials.insert('sk-1')
    model.navigator.goTo('providerCredentials')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <ProviderPrompt model={model} />,
      { width: 70, height: 10 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Name: nous')
    expect(captureCharFrame()).toContain('Url: https://n')
    expect(captureCharFrame()).toContain('API key: ••••')
    expect(captureCharFrame()).not.toContain('sk-1')
    act(() => renderer.destroy())
  })
})
