import type { KeyFlags } from './types.ts'

export class Keypress {
  readonly input: string
  readonly key: KeyFlags

  constructor(input: string, key: KeyFlags) {
    this.input = input
    this.key = key
  }

  isQuit() {
    return this.key.ctrl === true && this.input === 'c'
  }

  isEscape() {
    return this.key.escape === true || this.input === '\x1b'
  }
}
