import { describe, expect, it } from 'bun:test'
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

  it('when the key is nested and its array spans lines, highlights through the closing bracket', () => {
    const json =
      '{\n  "p": {\n    "i": [],\n    "w": [\n      "./dev",\n      "./agent"\n    ]\n  }\n}'

    const split = highlightJson({ json, key: 'w' })

    expect(split.before).toBe('{\n  "p": {\n    "i": [],\n    ')
    expect(split.highlighted).toBe(
      '"w": [\n      "./dev",\n      "./agent"\n    ]',
    )
    expect(split.after).toBe('\n  }\n}')
  })

  it('when the key is nested and its array is one line, highlights that line', () => {
    const json =
      '{\n  "p": {\n    "i": [],\n    "w": [\n      "./dev"\n    ]\n  }\n}'

    const split = highlightJson({ json, key: 'i' })

    expect(split.before).toBe('{\n  "p": {\n    ')
    expect(split.highlighted).toBe('"i": [],')
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
