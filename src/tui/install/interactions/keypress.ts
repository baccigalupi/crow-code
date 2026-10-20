import type { Signal } from '@preact/signals-core'
import type { ExitApp, InputBuffer, KeyFlags } from '../../types.ts'
import type { InstallState, KeypressArguments } from '../types.ts'
import { textInput } from './text-input.ts'

export class Keypress {
  private installData: InstallState
  private exit: ExitApp
  private input: string
  private key: KeyFlags

  constructor({ installData, exit, input, key }: KeypressArguments) {
    this.installData = installData
    this.exit = exit
    this.input = input
    this.key = key
  }

  handle() {
    if (this.isQuit()) this.exit()
    else if (this.installData.step.peek() === 'done') this.exit()
    else if (this.installData.step.peek() === 'confirm') this.confirm()
    else if (this.key.return === true) this.advance()
    else this.activeEdit()
  }

  private advance() {
    const step = this.installData.step.peek()
    if (step === 'repo') this.installData.step.value = 'user'
    else if (step === 'user') this.installData.step.value = 'env'
    else this.installData.step.value = 'confirm'
  }

  private confirm() {
    if (this.key.leftArrow === true || this.input === 'y') {
      this.installData.confirmation.value = true
    } else if (this.key.rightArrow === true || this.input === 'n') {
      this.installData.confirmation.value = false
    } else if (this.key.return === true) this.decide()
  }

  private decide() {
    if (this.installData.confirmation.peek() === true) this.write()
    else this.exit()
  }

  private write() {
    this.installData.step.value = 'write'
  }

  private activeEdit() {
    textInput({ text: this.activeText(), input: this.input, key: this.key })
      .edit()
  }

  private activeText(): Signal<InputBuffer> {
    const step = this.installData.step.peek()
    if (step === 'repo') return this.installData.repoDirectory
    else if (step === 'user') return this.installData.globalDirectory
    else return this.installData.envFile
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
