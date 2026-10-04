import { Signal, type TerminalAppOptions } from '@ubernaut/exotui/app'
import { input } from './components/input.ts'
import { conversation } from './components/conversation.ts'
import { statusBar } from './components/status-bar.ts'
import type { App, ReplAction } from './types.ts'

const mount = (app: App, lines: Signal<string[]>) => {
  statusBar(app)
  conversation(app, lines)
  const text = new Signal('')
  const component = input(app, lines, text)
  app.registerComponent(component, { id: 'repl-input' })
  app.focus.focus(component)
}

export class ReplOptions implements TerminalAppOptions<ReplAction> {
  id = 'crow-repl'
  label = 'crow repl'
  input = { captureKeyboardSignals: true }
  commands = [{
    id: 'app.quit',
    label: 'Quit',
    binding: { key: 'c', ctrl: true },
    action: { type: 'app.quit' as const },
  }]

  private lines: Signal<string[]>
  private onQuit: () => void

  constructor(lines: Signal<string[]>, onQuit: () => void) {
    this.lines = lines
    this.onQuit = onQuit

    this.onAction = this.onAction.bind(this)
    this.setup = this.setup.bind(this)
  }

  onAction(action: ReplAction) {
    if (action.type === 'app.quit') this.onQuit()
  }

  setup(app: App) {
    mount(app, this.lines)
  }
}
