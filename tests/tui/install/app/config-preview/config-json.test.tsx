import { describe, expect, it } from 'bun:test'
import { rgbToHex, type ScrollBoxRenderable } from '@opentui/core'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { ConfigJson } from '../../../../../src/tui/install/app/config-preview/config-json.tsx'

describe('ConfigJson', () => {
  it('when a line is highlighted, draws it dark on gold', async () => {
    const { renderer, renderOnce, captureSpans } = await testRender(
      <ConfigJson
        before={'{\n  "crowGlobalDirectory": "~/.crow",\n  '}
        highlighted={'"envFile": "~/.crow/.env",'}
        after={'\n  "providers": []\n}'}
      />,
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
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <ConfigJson
        before={'{\n  "a": 1,\n  "b": 2,\n  "c": 3,\n  "d": 4,\n  "e": 5,\n  '}
        highlighted={'"last": 6'}
        after={'\n}'}
      />,
      { width: 30, height: 6 },
    )

    await renderOnce()
    await renderOnce()

    expect(captureCharFrame()).toContain('"last": 6')
    act(() => renderer.destroy())
  })

  it('when scrolled away from the highlight, keeps the scroll across renders', async () => {
    const { renderer, renderOnce } = await testRender(
      <ConfigJson
        before={'{\n  "a": 1,\n  "b": 2,\n  "c": 3,\n  "d": 4,\n  "e": 5,\n  '}
        highlighted={'"last": 6'}
        after={'\n}'}
      />,
      { width: 30, height: 6 },
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
