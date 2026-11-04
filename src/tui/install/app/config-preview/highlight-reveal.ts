import type { Renderable, ScrollBoxRenderable } from '@opentui/core'

// Scrolls the config json so the highlighted line shows, once per new json.
// Each new json brings a fresh marker on the highlighted line; just before a
// draw, once layout is known, it is scrolled into view and marked shown, so
// the user's own scrolling is left alone until the json changes again.
export class HighlightReveal {
  private readonly waitingId = 'config-highlight'
  private readonly shownId = 'config-highlight-shown'
  private scrollbox: ScrollBoxRenderable

  constructor(scrollbox: ScrollBoxRenderable) {
    this.scrollbox = scrollbox
  }

  watch() {
    this.scrollbox.renderBefore = this.reveal.bind(this)
  }

  reveal() {
    if (this.waitingMarker() === undefined) return

    this.scrollbox.scrollChildIntoView(this.waitingId)
    this.markShown(this.waitingMarker() as Renderable)
  }

  private waitingMarker() {
    return this.scrollbox.findDescendantById(this.waitingId)
  }

  private markShown(marker: Renderable) {
    marker.id = this.shownId
  }
}

// React hands over the scrollbox once, when it mounts.
export const watchHighlight = (scrollbox: ScrollBoxRenderable | null) => {
  if (scrollbox === null) return

  new HighlightReveal(scrollbox).watch()
}
