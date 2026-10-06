import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { inputViewModel } from '../../../src/tui/views/input-view-model.ts'

describe('inputViewModel', () => {
  it('when the buffer is empty, is empty', () => {
    const buffer = { text: '', cursor: 0 }

    const view = inputViewModel({ buffer, height: 1 })

    expect(view).toEqual({ rowHeight: 1, buffer, isEmpty: true })
  })

  it('when the buffer has text, is not empty', () => {
    const buffer = { text: 'abc', cursor: 1 }

    const view = inputViewModel({ buffer, height: 2 })

    expect(view).toEqual({ rowHeight: 2, buffer, isEmpty: false })
  })
})
