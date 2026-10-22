import { describe, expect, it } from 'bun:test'
import { useReplKeys } from '../../../../../src/tui/agent/interactions/hooks/use-repl-keys.ts'
import { chatSession } from '../../../../../src/tui/agent/interactions/state.ts'
import { renderHook } from '../../../../support/render-hook.tsx'

describe('useReplKeys', () => {
  it('when no session is given, typed keys edit the singleton', () => {
    const { stdin, unmount } = renderHook(() => useReplKeys())

    stdin.write('a')

    expect(chatSession.buffer.value.text).toBe('a')
    chatSession.backspace()
    unmount()
  })
})
