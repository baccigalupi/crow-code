import { BoxRenderable, type CliRenderer } from '@opentui/core'
import { memoize } from '../../../decorators.ts'
import { HeaderView } from './header-view.ts'
import { ConfigPanelView } from './steps/config-panel-view.ts'
import { StepPromptsView } from './step-prompts-view.ts'

// The whole install screen, filling the terminal: header, config preview,
// then the current step's prompt on the bottom rows.
export class InstallScreen {
  readonly configPanel: ConfigPanelView
  readonly stepPrompts: StepPromptsView
  private renderer: CliRenderer
  private header: HeaderView

  constructor(renderer: CliRenderer) {
    this.renderer = renderer
    this.header = new HeaderView(renderer)
    this.configPanel = new ConfigPanelView(renderer)
    this.stepPrompts = new StepPromptsView(renderer)
  }

  mount() {
    const resize = (width: number, height: number) => this.resize(width, height)
    this.renderer.root.add(this.root())
    this.renderer.on('resize', resize)
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
    box.add(this.header.root())
    box.add(this.configPanel.root())
    box.add(this.stepPrompts.root())
    return box
  }
}
