import {
  BoxRenderable,
  TextRenderable,
  type RenderContext,
} from '@opentui/core'
import { memoize } from '../../../decorators.ts'
import { theme } from '../../theme.ts'

// Three chrome-coloured rows; the middle one holds the title and quit hint.
export class HeaderView {
  private renderer: RenderContext
  private readonly barOptions = {
    flexDirection: 'row',
    height: 1,
    width: '100%',
    paddingX: 1,
    justifyContent: 'space-between',
    backgroundColor: theme.chrome.background,
  } as const

  constructor(renderer: RenderContext) {
    this.renderer = renderer
  }

  @memoize
  root() {
    const options = { flexDirection: 'column', width: '100%' } as const
    const box = new BoxRenderable(this.renderer, options)
    box.add(this.bar([]))
    box.add(this.bar(['Installing Crow Code', 'ctrl-c quit']))
    box.add(this.bar([]))
    return box
  }

  private bar(contents: readonly string[]) {
    const bar = new BoxRenderable(this.renderer, this.barOptions)
    contents.forEach((content) => bar.add(this.chromeText(content)))
    return bar
  }

  private chromeText(content: string) {
    const fg = theme.chrome.textColor
    return new TextRenderable(this.renderer, { content, fg })
  }
}
