import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { highlightJson } from '../../../../src/tui/install/crow-config/highlight.ts'

describe('highlightJson', () => {
  it('when the key is the last key, highlights its line', () => {
    const json = '{\n  "a": "x",\n  "b": "y"\n}'

    const split = highlightJson({ json, key: 'b' })

    expect(split.before).toBe('{\n  "a": "x",\n  ')
    expect(split.highlighted).toBe('"b": "y"')
    expect(split.after).toBe('\n}')
  })

  it('when another key follows, the trailing comma is highlighted', () => {
    const json = '{\n  "a": "x",\n  "b": "y"\n}'

    const split = highlightJson({ json, key: 'a' })

    expect(split.highlighted).toBe('"a": "x",')
  })

  it('when the value is an object, highlights through its closing brace', () => {
    const json = '{\n  "a": "x",\n  "p": {\n    "i": [],\n    "j": 1\n  }\n}'

    const split = highlightJson({ json, key: 'p' })

    expect(split.highlighted).toBe('"p": {\n    "i": [],\n    "j": 1\n  }')
    expect(split.after).toBe('\n}')
  })

  it('when the key is empty, highlights nothing', () => {
    const json = '{\n  "a": 1\n}'

    const split = highlightJson({ json, key: '' })

    expect(split.before).toBe('{\n  "a": 1\n}')
    expect(split.highlighted).toBe('')
    expect(split.after).toBe('')
  })

  it('when the key is missing, highlights nothing', () => {
    const json = '{\n  "a": 1\n}'

    const split = highlightJson({ json, key: 'zzz' })

    expect(split.before).toBe('{\n  "a": 1\n}')
    expect(split.highlighted).toBe('')
    expect(split.after).toBe('')
  })
})
