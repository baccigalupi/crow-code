import { describe, expect, it } from 'bun:test'
import type { ScrollBoxRenderable } from '@opentui/core'
import { HighlightScroll } from '../../../../../src/tui/install/app/config-preview/highlight-scroll.ts'

describe('HighlightScroll', () => {
  it('when aimed at a row, scrolls the box to it', () => {
    const box = { current: { scrollTop: 0 } as ScrollBoxRenderable }
    const scroll = new HighlightScroll(box)
    scroll.aim(7)

    scroll.scroll()

    expect(box.current.scrollTop).toBe(7)
  })

  it('when it has already scrolled, leaves the box where the user put it', () => {
    const box = { current: { scrollTop: 0 } as ScrollBoxRenderable }
    const scroll = new HighlightScroll(box)
    scroll.aim(7)
    scroll.scroll()
    box.current.scrollTop = 2

    scroll.scroll()

    expect(box.current.scrollTop).toBe(2)
  })

  it('when never aimed, leaves the box alone', () => {
    const box = { current: { scrollTop: 3 } as ScrollBoxRenderable }
    const scroll = new HighlightScroll(box)

    scroll.scroll()

    expect(box.current.scrollTop).toBe(3)
  })
})
