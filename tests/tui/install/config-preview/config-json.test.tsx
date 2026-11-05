import { describe, expect, it } from 'bun:test'
import { rgbToHex, type ScrollBoxRenderable } from '@opentui/core'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { ConfigJson } from '../../../../src/tui/install/config-preview/config-json.tsx'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ConfigJson', () => {
  it('when a line is highlighted, draws it dark on gold', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.navigator.goTo('envFile')
    const { renderer, renderOnce, captureSpans } = await testRender(
      <ConfigJson store={store} />,
      { width: 70, height: 24 },
    )

    await renderOnce()

    const highlighted = captureSpans().lines[4].spans[1]
    expect(highlighted.text).toBe('"envFile": "~/.crow/.env",')
    expect(rgbToHex(highlighted.fg)).toBe('#0a0f1e')
    expect(rgbToHex(highlighted.bg)).toBe('#e6ca6c')
    act(() => renderer.destroy())
  })

  it('when a provider name is being typed, highlights it in the last provider', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.providers.save({ name: 'nous', url: 'https://n' }, '')
    store.providerEditForm.providerName.replace('local')
    store.navigator.goTo('providerName')
    const { renderer, renderOnce, captureSpans } = await testRender(
      <ConfigJson store={store} />,
      { width: 70, height: 60 },
    )

    await renderOnce()

    const lines = captureSpans().lines
    expect(lines[21].spans[0].text).toContain('"name": "nous",')
    expect(rgbToHex(lines[21].spans[0].bg)).toBe('#0a0f1e')
    expect(lines[25].spans[1].text).toBe('"name": "local",')
    expect(rgbToHex(lines[25].spans[1].bg)).toBe('#e6ca6c')
    act(() => renderer.destroy())
  })

  it('when the json is taller than its rows, scrolls the highlighted line into view', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.navigator.goTo('escalateWrite')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <ConfigJson store={store} />,
      { width: 70, height: 6 },
    )

    await renderOnce()
    await renderOnce()

    expect(captureCharFrame()).toContain('"escalateWrite"')
    act(() => renderer.destroy())
  })

  it('when scrolled away from the highlight, keeps the scroll across renders', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.navigator.goTo('escalateWrite')
    const { renderer, renderOnce } = await testRender(
      <ConfigJson store={store} />,
      { width: 70, height: 6 },
    )
    await renderOnce()
    await renderOnce()
    const scrollbox = renderer.root.findDescendantById(
      'config-json',
    ) as ScrollBoxRenderable

    scrollbox.scrollTop = 0
    await renderOnce()

    expect(scrollbox.scrollTop).toBe(0)
    act(() => renderer.destroy())
  })
})
