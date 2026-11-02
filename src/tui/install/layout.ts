import { BoxRenderable, type CliRenderer } from '@opentui/core'
import { memoize } from '../../decorators.ts'
import type { Panels } from './panels.ts'
import type { ConfigPanelProps, PanelName, StepProps } from './types.ts'

// The whole install screen, filling the terminal: header, config preview,
// then the current panel's prompt on the bottom rows. The only place a panel
// is asked for its view. A new prompt view replaces the old one when the panel
// changes, so focus and layout start fresh for each kind of prompt.
export class Layout {
  private renderer: CliRenderer
  private panels: Panels
  private shown = ''
  private prompt!: { update(props: StepProps): void }

  constructor(renderer: CliRenderer, panels: Panels) {
    this.renderer = renderer
    this.panels = panels
  }

  mount() {
    const resize = (width: number, height: number) => this.resize(width, height)
    this.renderer.root.add(this.root())
    this.renderer.on('resize', resize)
  }

  drawPreview(props: ConfigPanelProps) {
    this.preview().update(props)
  }

  drawPrompt(name: PanelName, props: StepProps) {
    if (name !== this.shown) {
      this.swap(name)
    }
    this.prompt.update(props)
  }

  private swap(name: PanelName) {
    const view = this.panels.get(name).view(this.renderer)
    this.slot()
      .getChildren()
      .forEach((child) => child.destroyRecursively())
    this.slot().add(view.root())
    this.shown = name
    this.prompt = view
  }

  private resize(width: number, height: number) {
    this.root().width = width
    this.root().height = height
  }

  @memoize
  private root() {
    const { width, height } = this.renderer
    const options = { flexDirection: 'column', width, height } as const
    const box = new BoxRenderable(this.renderer, options)
    box.add(this.panels.header.view(this.renderer).root())
    box.add(this.preview().root())
    box.add(this.slot())
    return box
  }

  @memoize
  private preview() {
    return this.panels.preview.view(this.renderer)
  }

  @memoize
  private slot() {
    return new BoxRenderable(this.renderer, {
      flexDirection: 'column',
      flexGrow: 1,
      flexShrink: 0,
      justifyContent: 'flex-end',
    })
  }
}
