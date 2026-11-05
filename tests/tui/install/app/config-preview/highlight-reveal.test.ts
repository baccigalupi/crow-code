import { describe, expect, it, mock } from 'bun:test'
import type { ScrollBoxRenderable } from '@opentui/core'
import { HighlightReveal } from '../../../../../src/tui/install/app/config-preview/highlight-reveal.ts'

describe('HighlightReveal', () => {
  it('when revealing, scrolls the highlighted line into view', () => {
    const scrollChildIntoView = mock()
    const scrollbox = { scrollChildIntoView } as unknown as ScrollBoxRenderable

    new HighlightReveal(scrollbox).reveal()

    expect(scrollChildIntoView.mock.calls).toEqual([['config-highlight']])
  })

  it('when revealing, stops watching so later draws leave the scroll alone', () => {
    const scrollbox = {
      scrollChildIntoView: mock(),
      renderBefore: mock(),
    } as unknown as ScrollBoxRenderable

    new HighlightReveal(scrollbox).reveal()

    expect(scrollbox.renderBefore).toBeUndefined()
  })

  it('when watching, reveals just before the next draw', () => {
    const scrollbox = {} as ScrollBoxRenderable

    new HighlightReveal(scrollbox).watch()

    expect(typeof scrollbox.renderBefore).toBe('function')
  })
})
