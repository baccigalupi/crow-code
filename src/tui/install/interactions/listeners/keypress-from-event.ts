import type { KeyEvent } from '@opentui/core'
import type { KeyFlags } from '../../../types.ts'

class Keypress {
  private readonly namedKeys: Record<string, string> = {
    return: 'return',
    tab: 'tab',
    backspace: 'backspace',
    delete: 'delete',
    escape: 'escape',
    left: 'leftArrow',
    right: 'rightArrow',
    up: 'upArrow',
    down: 'downArrow',
    home: 'home',
    end: 'end',
  }

  private readonly event: KeyEvent

  constructor(event: KeyEvent) {
    this.event = event
  }

  keypress(): { input: string; key: KeyFlags } {
    if (!Object.hasOwn(this.namedKeys, this.event.name)) {
      return { input: this.input(), key: this.modifiers() }
    }

    return {
      input: '',
      key: { ...this.modifiers(), [this.namedKeys[this.event.name]]: true },
    }
  }

  private modifiers() {
    const { ctrl, shift, meta } = this.event
    return { ctrl, shift, meta }
  }

  private input() {
    if (this.event.ctrl || this.event.meta) {
      return this.event.name
    }

    return this.event.sequence
  }
}

export const keypressFromEvent = (event: KeyEvent) => {
  return new Keypress(event).keypress()
}
