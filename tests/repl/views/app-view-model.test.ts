import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { appViewModel } from '../../../src/repl/views/app-view-model.ts'
import type { AppViewModelArguments } from '../../../src/repl/types.ts'

describe('appViewModel', () => {
  it('when stdout reports a size, derives the chat row height from it', () => {
    const stdout = { columns: 100, rows: 30 } as AppViewModelArguments['stdout']
    const state = {
      buffer: { text: 'hi', cursor: 2 },
      inputRows: 2,
      history: [{ id: 'e0', text: 'a' }],
    }

    const view = appViewModel({ stdout, state })

    expect(view).toEqual({
      columnWidth: 100,
      rowHeight: 30,
      chatRowHeight: 25,
      history: [{ id: 'e0', text: 'a' }],
      buffer: { text: 'hi', cursor: 2 },
      inputRows: 2,
    })
  })

  it('when stdout reports no size, falls back to 80 by 24', () => {
    const stdout = {} as AppViewModelArguments['stdout']
    const state = { buffer: { text: '', cursor: 0 }, inputRows: 1, history: [] }

    const view = appViewModel({ stdout, state })

    expect(view.columnWidth).toBe(80)
    expect(view.rowHeight).toBe(24)
    expect(view.chatRowHeight).toBe(20)
  })
})
