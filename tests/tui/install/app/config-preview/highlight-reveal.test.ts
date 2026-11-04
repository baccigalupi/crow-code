import { describe, expect, it, mock } from 'bun:test'
import type { ScrollBoxRenderable } from '@opentui/core'
import { HighlightReveal } from '../../../../../src/tui/install/app/config-preview/highlight-reveal.ts'

describe('HighlightReveal', () => {
  it('when a new marker is waiting, scrolls it into view and marks it shown', () => {
    const marker = { id: 'config-highlight' }
    const scrollChildIntoView = mock()
    const scrollbox = {
      findDescendantById: () => marker,
      scrollChildIntoView,
    } as unknown as ScrollBoxRenderable

    new HighlightReveal(scrollbox).reveal()

    expect(scrollChildIntoView.mock.calls).toEqual([['config-highlight']])
    expect(marker.id).toBe('config-highlight-shown')
  })

  it('when no marker is waiting, leaves the scroll alone', () => {
    const scrollChildIntoView = mock()
    const scrollbox = {
      findDescendantById: () => undefined,
      scrollChildIntoView,
    } as unknown as ScrollBoxRenderable

    new HighlightReveal(scrollbox).reveal()

    expect(scrollChildIntoView.mock.calls).toEqual([])
  })

  it('when watching, reveals just before each draw', () => {
    const scrollbox = {} as ScrollBoxRenderable

    new HighlightReveal(scrollbox).watch()

    expect(typeof scrollbox.renderBefore).toBe('function')
  })
})
