import {
  BoxRenderable,
  ScrollBoxRenderable,
  TextRenderable,
  bg,
  fg,
  t,
  type RenderContext,
} from '@opentui/core'
import { memoize } from '../../../../decorators.ts'
import { theme } from '../../../theme.ts'
import type { HighlightedJson } from '../../types.ts'

// Shows the config json in the rows it is given, scrolled so the highlighted
// line is in view.
export class ConfigJsonView {
  private renderer: RenderContext
  private highlightedRow = 0
  private scrollPending = false
  // Takes only the rows left to it.
  private readonly shrinkOptions = {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  } as const
  private readonly jsonBoxOptions = {
    flexDirection: 'column',
    alignSelf: 'flex-start',
    flexShrink: 0,
    backgroundColor: theme.configPanel.background,
    paddingX: 2,
    paddingY: 1,
    marginTop: 1,
  } as const

  constructor(renderer: RenderContext) {
    this.renderer = renderer
  }

  @memoize
  root() {
    const renderBefore = () => this.scrollToHighlight()
    const options = { ...this.shrinkOptions, renderBefore }
    const box = new ScrollBoxRenderable(this.renderer, options)
    box.add(this.jsonBox())
    return box
  }

  update(sections: HighlightedJson) {
    const { before, highlighted, after } = sections
    this.json().content = t`${before}${this.highlight(highlighted)}${after}`
    this.json().height = `${before}${highlighted}${after}`.split('\n').length
    this.highlightedRow = this.highlightRow(before)
    this.scrollPending = true
  }

  // Scrolling clamps to the laid-out height, so it waits until a render has
  // laid out the new json, then scrolls once and leaves the user's scrolling
  // alone.
  private scrollToHighlight() {
    if (!this.scrollPending || this.isLayoutBehind()) return
    this.root().scrollTop = this.highlightedRow
    this.scrollPending = false
  }

  private isLayoutBehind() {
    const { marginTop, paddingY } = this.jsonBoxOptions
    const height = marginTop + paddingY * 2 + this.json().height
    return this.root().scrollHeight < height
  }

  // Rows above the highlighted line: the json box's margin and padding,
  // then every line before it.
  private highlightRow(before: string) {
    const { marginTop, paddingY } = this.jsonBoxOptions
    return marginTop + paddingY + before.split('\n').length - 1
  }

  private highlight(text: string) {
    const { highlightBackground, highlightTextColor } = theme.configPanel
    return fg(highlightTextColor)(bg(highlightBackground)(text))
  }

  private jsonBox() {
    const box = new BoxRenderable(this.renderer, this.jsonBoxOptions)
    box.add(this.json())
    return box
  }

  // Text measures to the rows it is offered, so update gives it the json's
  // full height to scroll through.
  @memoize
  private json() {
    return new TextRenderable(this.renderer, { content: '', flexShrink: 0 })
  }
}
