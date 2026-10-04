import { Signal } from '@ubernaut/exotui/app'
import type { App } from '../types.ts'
import { chat } from './chat.ts'
import { header } from './header.ts'
import { type UserInput, userInput } from './user-input.ts'

export const layout = (app: App, lines: Signal<string[]>) =>
  new Layout(app, lines).setup()

export class Layout {
  private readonly app: App
  private readonly lines: Signal<string[]>
  private readonly text: Signal<string>
  private _input?: UserInput

  constructor(app: App, lines: Signal<string[]>) {
    this.app = app
    this.lines = lines
    this.text = new Signal('')
  }

  setup() {
    header(this.app)
    chat(this.app, this.lines)
    this.app.registerComponent(this.input().component, { id: 'user-input' })
    this.app.focus.focus(this.input().component)
  }

  private input() {
    if (this._input) return this._input
    this._input = userInput(this.app, this.lines, this.text)
    return this._input
  }
}
