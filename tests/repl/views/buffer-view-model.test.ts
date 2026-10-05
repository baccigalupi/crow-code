import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { bufferViewModel } from '../../../src/repl/views/buffer-view-model.ts'

describe('bufferViewModel', () => {
  it('when the buffer is empty, shows a blank cursor', () => {
    const buffer = { text: '', cursor: 0 }

    const view = bufferViewModel(buffer)

    expect(view).toEqual({ before: '', cursor: ' ', after: '' })
  })

  it('when the cursor is mid-text, splits around the cursor character', () => {
    const buffer = { text: 'abc', cursor: 1 }

    const view = bufferViewModel(buffer)

    expect(view).toEqual({ before: 'a', cursor: 'b', after: 'c' })
  })

  it('when the cursor is at the end, shows a blank cursor after the text', () => {
    const buffer = { text: 'ab', cursor: 2 }

    const view = bufferViewModel(buffer)

    expect(view).toEqual({ before: 'ab', cursor: ' ', after: '' })
  })
})
