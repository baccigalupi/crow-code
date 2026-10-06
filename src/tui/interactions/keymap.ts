import type { KeyFlags, ReplAction } from '../types.ts'

export class Keymap {
  private input: string
  private key: KeyFlags
  private terminalReplyPattern = /^\[[0-9;?]*[A-Za-z~]$/

  constructor(input: string, key: KeyFlags) {
    this.input = input
    this.key = key
  }

  action(): ReplAction | null {
    if (this.isQuit()) return { kind: 'quit' }
    else if (this.isNewline()) return { kind: 'newline' }
    else if (this.isIgnored()) return null
    return this.editAction()
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

  private editAction(): ReplAction | null {
    if (this.key.return === true) return { kind: 'submit' }
    else if (this.input.length === 0) return this.navigationAction()
    return { kind: 'insert', text: this.input }
  }

  private navigationAction(): ReplAction | null {
    if (this.key.backspace === true) return { kind: 'backspace' }
    else if (this.key.delete === true) return { kind: 'delete' }
    return this.cursorAction()
  }

  private cursorAction(): ReplAction | null {
    if (this.key.leftArrow === true) return { kind: 'move', to: 'left' }
    else if (this.key.rightArrow === true) return { kind: 'move', to: 'right' }
    else if (this.key.home === true) return { kind: 'move', to: 'home' }
    else if (this.key.end === true) return { kind: 'move', to: 'end' }
    return null
  }
}

export const keyToAction = (input: string, key: KeyFlags) => {
  return new Keymap(input, key).action()
}
