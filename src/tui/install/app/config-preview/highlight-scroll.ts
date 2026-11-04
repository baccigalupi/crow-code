import type { ScrollBoxRenderable } from '@opentui/core'

// Scrolls the config json to the highlighted row once per new json, just
// before drawing, when layout already has the new height, then leaves the
// user's scrolling alone.
export class HighlightScroll {
  private box: { current: ScrollBoxRenderable | null }
  private row = 0
  private pending = false

  constructor(box: { current: ScrollBoxRenderable | null }) {
    this.box = box
  }

  aim(row: number) {
    this.row = row
    this.pending = true
  }

  scroll() {
    if (!this.pending) return

    const box = this.box.current as ScrollBoxRenderable
    box.scrollTop = this.row
    this.pending = false
  }
}
