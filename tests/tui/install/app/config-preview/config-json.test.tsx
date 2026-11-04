import { describe, expect, it } from 'bun:test'
import { rgbToHex, type ScrollBoxRenderable } from '@opentui/core'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { ConfigJson } from '../../../../../src/tui/install/app/config-preview/config-json.tsx'
import { DataStore } from '../../../../../src/tui/install/data-store.ts'
import { Router } from '../../../../../src/tui/install/router.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('ConfigJson', () => {
  it('when a line is highlighted, draws it dark on gold', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.navigator.goTo('envFile')
    const { renderer, renderOnce, captureSpans } = await testRender(
      <ConfigJson model={model} router={new Router()} />,
      { width: 70, height: 24 },
    )

    await renderOnce()

    const highlighted = captureSpans().lines[4].spans[1]
    expect(highlighted.text).toBe('"envFile": "~/.crow/.env",')
    expect(rgbToHex(highlighted.fg)).toBe('#0a0f1e')
    expect(rgbToHex(highlighted.bg)).toBe('#e6ca6c')
    act(() => renderer.destroy())
  })

  it('when the json is taller than its rows, scrolls the highlighted line into view', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.navigator.goTo('escalateWrite')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <ConfigJson model={model} router={new Router()} />,
      { width: 70, height: 6 },
    )

    await renderOnce()
    await renderOnce()

    expect(captureCharFrame()).toContain('"escalateWrite"')
    act(() => renderer.destroy())
  })

  it('when scrolled away from the highlight, keeps the scroll across renders', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.navigator.goTo('escalateWrite')
    const { renderer, renderOnce } = await testRender(
      <ConfigJson model={model} router={new Router()} />,
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
