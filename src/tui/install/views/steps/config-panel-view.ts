import {
  BoxRenderable,
  TextRenderable,
  type RenderContext,
} from '@opentui/core'
import { memoize } from '../../../../decorators.ts'
import type { ConfigPanelProps } from '../../types.ts'
import { ConfigJsonView } from './config-json-view.ts'

// Draws the crow config being built, with the line the current step edits
// highlighted.
export class ConfigPanelView {
  private renderer: RenderContext
  private readonly configJson: ConfigJsonView
  // Shrinks to the rows the step prompt leaves, scrolling the json.
  private readonly rootOptions = {
    flexDirection: 'column',
    paddingX: 1,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  } as const

  constructor(renderer: RenderContext) {
    this.renderer = renderer
    this.configJson = new ConfigJsonView(renderer)
  }

  @memoize
  root() {
    const box = new BoxRenderable(this.renderer, this.rootOptions)
    box.add(this.path())
    box.add(this.configJson.root())
    return box
  }

  update({ visible, crowConfigPath, ...sections }: ConfigPanelProps) {
    this.root().visible = visible
    this.path().content = `Installing repo config in: ${crowConfigPath}`
    this.configJson.update(sections)
  }

  @memoize
  private path() {
    return new TextRenderable(this.renderer, { content: '', flexShrink: 0 })
  }
}
