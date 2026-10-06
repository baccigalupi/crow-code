import { chatSession } from './state.ts'
import type { ChatSession } from './state/chat-session.ts'
import type { ExitApp, KeyFlags } from '../types.ts'

export class Keymap {
  private exit: ExitApp
  private session: ChatSession
  private input = ''
  private key: KeyFlags = {}
  private terminalReplyPattern = /^\[[0-9;?]*[A-Za-z~]$/

  constructor(exit: ExitApp, session: ChatSession = chatSession) {
    this.exit = exit
    this.session = session
  }

  handle(input: string, key: KeyFlags) {
    this.input = input
    this.key = key
    this.dispatch()
  }

  private dispatch() {
    if (this.isQuit()) this.exit()
    else if (this.isNewline()) this.session.newline()
    else if (!this.isIgnored()) this.edit()
  }

  private edit() {
    if (this.key.return === true) this.session.submit()
    else if (this.input.length === 0) this.navigate()
    else this.session.insert(this.input)
  }

  private navigate() {
    if (this.key.backspace === true) this.session.backspace()
    else if (this.key.delete === true) this.session.delete()
    else this.cursor()
  }

  private cursor() {
    if (this.key.leftArrow === true) this.session.moveCursor('left')
    else if (this.key.rightArrow === true) this.session.moveCursor('right')
    else if (this.key.home === true) this.session.moveCursor('home')
    else if (this.key.end === true) this.session.moveCursor('end')
  }

  private isQuit() {
    return this.key.ctrl === true && this.input === 'c'
  }

  private isNewline() {
    return this.isModifiedReturn() || this.input === '\n'
  }

  private isModifiedReturn() {
    if (this.key.return !== true) return false

    return this.key.shift === true || this.key.meta === true
  }

  private isIgnored() {
    return this.isModified() || this.isTerminalReply()
  }

  private isModified() {
    return this.key.ctrl === true || this.key.meta === true
  }

  private isTerminalReply() {
    return this.terminalReplyPattern.test(this.input) ||
      this.input.includes('\x1b')
  }
}
