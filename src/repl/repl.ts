import type { Signal, TerminalAppOptions } from '@ubernaut/exotui/app'
import { layout } from './components/layout.ts'
import type { App, ReplAction } from './types.ts'

export class ReplOptions implements TerminalAppOptions<ReplAction> {
  id = 'crow-repl'
  label = 'crow repl'
  input = { captureKeyboardSignals: true }
  commands = [
    {
      id: 'app.quit',
      label: 'Quit',
      binding: { key: 'c', ctrl: true },
      action: { type: 'app.quit' as const },
    },
  ]

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
    layout(app, this.lines)
  }
}
