import {
  deleteBackward,
  deleteForward,
  insertText,
  moveCursor,
} from '../../input-buffer.ts'
import type { Signal } from '@preact/signals-core'
import type { CursorMove, ExitApp, InputBuffer, KeyFlags } from '../../types.ts'
import type { InstallKeysArgs } from '../types.ts'

export class InstallKeys {
  private repo: Signal<InputBuffer>
  private user: Signal<InputBuffer>
  private step: InstallKeysArgs['step']
  private exit: ExitApp
  private input = ''
  private key: KeyFlags = {}

  constructor(args: InstallKeysArgs, exit: ExitApp) {
    this.repo = args.repo
    this.user = args.user
    this.step = args.step
    this.exit = exit
  }

  handle(input: string, key: KeyFlags) {
    this.input = input
    this.key = key
    this.dispatch()
  }

  private dispatch() {
    if (this.isQuit()) this.exit()
    else if (this.key.return === true) this.advance()
    else this.edit(this.activeBuffer())
  }

  private advance() {
    if (this.step.peek() === 'repo') this.step.value = 'user'
    else this.exit()
  }

  private activeBuffer() {
    if (this.step.peek() === 'repo') return this.repo
    return this.user
  }

  private edit(buffer: Signal<InputBuffer>) {
    if (this.key.backspace === true) {
      buffer.value = deleteBackward(buffer.peek())
    } else if (this.key.delete === true) {
      buffer.value = deleteForward(buffer.peek())
    } else this.cursorOrInsert(buffer)
  }

  private cursorOrInsert(buffer: Signal<InputBuffer>) {
    if (this.key.leftArrow === true) this.move(buffer, 'left')
    else if (this.key.rightArrow === true) this.move(buffer, 'right')
    else if (this.key.home === true) this.move(buffer, 'home')
    else if (this.key.end === true) this.move(buffer, 'end')
    else this.insert(buffer)
  }

  private move(buffer: Signal<InputBuffer>, to: CursorMove) {
    buffer.value = moveCursor(buffer.peek(), to)
  }

  private insert(buffer: Signal<InputBuffer>) {
    if (this.isIgnored()) return

    buffer.value = insertText(buffer.peek(), this.input)
  }

  private isQuit() {
    return this.key.escape === true ||
      (this.key.ctrl === true && this.input === 'c') ||
      this.input === '\x1b'
  }

  private isIgnored() {
    return this.input.length === 0 || this.isModified()
  }

  private isModified() {
    return this.key.ctrl === true || this.key.meta === true
  }
}
