import type { KeyEvent } from '@opentui/core'
import type { KeyFlags } from '../../../tui/types.ts'

const namedKeys: Record<string, string> = {
  return: 'return',
  backspace: 'backspace',
  delete: 'delete',
  escape: 'escape',
  left: 'leftArrow',
  right: 'rightArrow',
  home: 'home',
  end: 'end',
}

const modifiers = (event: KeyEvent) => {
  return { ctrl: event.ctrl, shift: event.shift, meta: event.meta }
}

const inputFor = (event: KeyEvent) => {
  if (event.ctrl || event.meta) {
    return event.name
  }

  return event.sequence
}

export const keypressFromEvent = (
  event: KeyEvent,
): { input: string; key: KeyFlags } => {
  if (!Object.hasOwn(namedKeys, event.name)) {
    return { input: inputFor(event), key: modifiers(event) }
  }

  return {
    input: '',
    key: { ...modifiers(event), [namedKeys[event.name]]: true },
  }
}
