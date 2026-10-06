import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { visibleHistory } from '../../../src/tui/interactions/visible-history.ts'
import type { HistoryEntry } from '../../../src/tui/types.ts'

describe('visibleHistory', () => {
  it('when history fits, all entries are visible', () => {
    const history = [
      { id: 'e0', text: 'a' },
      { id: 'e1', text: 'b' },
    ]

    const visible = visibleHistory(history, 10, 80)

    expect(visible).toEqual(history)
  })

  it('when history overflows, the oldest entries are dropped', () => {
    const history = [
      { id: 'e0', text: 'a' },
      { id: 'e1', text: 'b' },
      { id: 'e2', text: 'c' },
      { id: 'e3', text: 'd' },
    ]

    const visible = visibleHistory(history, 2, 80)

    expect(visible).toEqual([
      { id: 'e2', text: 'c' },
      { id: 'e3', text: 'd' },
    ])
  })

  it('when an entry does not fit, older entries stop being added', () => {
    const history = [
      { id: 'e0', text: 'a' },
      { id: 'e1', text: 'b' },
      { id: 'e2', text: 'c\nc' },
      { id: 'e3', text: 'd' },
    ]

    const visible = visibleHistory(history, 3, 80)

    expect(visible).toEqual([
      { id: 'e2', text: 'c\nc' },
      { id: 'e3', text: 'd' },
    ])
  })

  it('when an entry is taller than the area, it is excluded', () => {
    const history = [
      { id: 'e0', text: 'a\nb\nc' },
      { id: 'e1', text: 'd' },
    ]

    const visible = visibleHistory(history, 2, 80)

    expect(visible).toEqual([{ id: 'e1', text: 'd' }])
  })

  it('when history is empty, nothing is visible', () => {
    const history: HistoryEntry[] = []

    const visible = visibleHistory(history, 10, 80)

    expect(visible).toEqual([])
  })

  it('when the area has no rows, nothing is visible', () => {
    const history = [{ id: 'e0', text: 'a' }]

    const visible = visibleHistory(history, 0, 80)

    expect(visible).toEqual([])
  })
})
