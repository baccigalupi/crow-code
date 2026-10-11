import type { Signal } from '@preact/signals-core'
import type { ExitApp, InputBuffer, KeyFlags } from '../../types.ts'
import type { KeypressArguments, KeypressSignals } from '../types.ts'
import { installConfig } from '../install-config.ts'
import { textInput } from './text-input.ts'

export class Keypress {
  private signals: KeypressSignals
  private exit: ExitApp
  private input: string
  private key: KeyFlags

  constructor({ signals, exit, input, key }: KeypressArguments) {
    this.signals = signals
    this.exit = exit
    this.input = input
    this.key = key
  }

  handle() {
    if (this.isQuit()) this.exit()
    else if (this.signals.step.peek() === 'done') this.exit()
    else if (this.signals.step.peek() === 'confirm') this.confirm()
    else if (this.key.return === true) this.advance()
    else this.activeEdit()
  }

  private advance() {
    if (this.signals.step.peek() === 'repo') this.signals.step.value = 'user'
    else this.signals.step.value = 'confirm'
  }

  private confirm() {
    if (this.key.leftArrow === true || this.input === 'y') {
      this.signals.confirmation.value = true
    } else if (this.key.rightArrow === true || this.input === 'n') {
      this.signals.confirmation.value = false
    } else if (this.key.return === true) this.decide()
  }

  private decide() {
    if (this.signals.confirmation.peek() === true) this.write()
    else this.exit()
  }

  private write() {
    this.signals.save(this.config())
    this.signals.step.value = 'done'
  }

  private config() {
    const repo = this.signals.repo.peek()
    const user = this.signals.user.peek()
    return installConfig({ repo, user }).all()
  }

  private activeEdit() {
    textInput({ text: this.activeText(), input: this.input, key: this.key })
      .edit()
  }

  private activeText(): Signal<InputBuffer> {
    if (this.signals.step.peek() === 'repo') return this.signals.repo
    return this.signals.user
  }

  private isQuit() {
    return this.key.escape === true ||
      (this.key.ctrl === true && this.input === 'c') ||
      this.input === '\x1b'
  }
}

export const keypress = (keypressArguments: KeypressArguments) => {
  return new Keypress(keypressArguments)
}
