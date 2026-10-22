import { describe, expect, it } from 'bun:test'
import { useResize } from '../../../../../src/tui/agent/interactions/hooks/use-resize.ts'
import { chatSession } from '../../../../../src/tui/agent/interactions/state.ts'
import { mockTerminal } from '../../../../support/mock-terminal.ts'
import { renderHook } from '../../../../support/render-hook.tsx'

describe('useResize', () => {
  it('when no session is given, measures into the singleton', async () => {
    const terminal = mockTerminal({ columns: 120 })
    const { unmount } = renderHook(() =>
      useResize(terminal.stdout as unknown as NodeJS.WriteStream),
    )

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(chatSession.columns.value).toBe(120)
    chatSession.resize(80)
    unmount()
  })
})
