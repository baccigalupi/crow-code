import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { chatViewModel } from '../../../src/repl/views/chat-view-model.ts'

describe('chatViewModel', () => {
  it('when history fits, returns every entry as a history line', () => {
    const history = [
      { id: 'e0', text: 'a' },
      { id: 'e1', text: 'b' },
    ]

    const { histories } = chatViewModel({ history, height: 10, width: 80 })

    expect(histories).toEqual([
      { id: 'e0', text: 'a' },
      { id: 'e1', text: 'b' },
    ])
  })

  it('when an entry is blank, renders it as a single space', () => {
    const history = [{ id: 'e0', text: '' }]

    const { histories } = chatViewModel({ history, height: 10, width: 80 })

    expect(histories).toEqual([{ id: 'e0', text: ' ' }])
  })

  it('when history overflows the height, drops the oldest entries', () => {
    const history = [
      { id: 'e0', text: 'a' },
      { id: 'e1', text: 'b' },
      { id: 'e2', text: 'c' },
    ]

    const { histories } = chatViewModel({ history, height: 2, width: 80 })

    expect(histories).toEqual([
      { id: 'e1', text: 'b' },
      { id: 'e2', text: 'c' },
    ])
  })
})
