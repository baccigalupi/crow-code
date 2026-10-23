import { describe, expect, it } from 'bun:test'
import { inputTextViewModel } from '../../src/opentui/input-text-view-model.ts'

describe('inputTextViewModel', () => {
  it('when the input is empty, shows a blank cursor', () => {
    const input = { text: '', cursor: 0 }

    const view = inputTextViewModel(input)

    expect(view).toEqual({ before: '', cursor: ' ', after: '' })
  })

  it('when the cursor is mid-text, splits around the cursor character', () => {
    const input = { text: 'abc', cursor: 1 }

    const view = inputTextViewModel(input)

    expect(view).toEqual({ before: 'a', cursor: 'b', after: 'c' })
  })

  it('when the cursor is at the end, shows a blank cursor after the text', () => {
    const input = { text: 'ab', cursor: 2 }

    const view = inputTextViewModel(input)

    expect(view).toEqual({ before: 'ab', cursor: ' ', after: '' })
  })
})
