import type { ScrollBoxRenderable } from '@opentui/core'

// Scrolls a freshly mounted config json so its highlighted line shows. It
// waits for the first draw, when layout is known, scrolls once, then stops,
// leaving the user's own scrolling alone until the next mount.
export class HighlightReveal {
  private readonly highlightId = 'config-highlight'
  private scrollbox: ScrollBoxRenderable

  constructor(scrollbox: ScrollBoxRenderable) {
    this.scrollbox = scrollbox
  }

  watch() {
    this.scrollbox.renderBefore = this.reveal.bind(this)
  }

  reveal() {
    this.scrollbox.scrollChildIntoView(this.highlightId)
    this.scrollbox.renderBefore = undefined
  }
}

// React hands over the scrollbox once, when it mounts.
export const watchHighlight = (scrollbox: ScrollBoxRenderable | null) => {
  if (scrollbox === null) return

  new HighlightReveal(scrollbox).watch()
}
