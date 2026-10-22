import { describe, expect, it } from 'bun:test'
import { summary } from '../../../agents/coverage/summary.ts'

describe('summary', () => {
  it('when a file has half its branches covered, formats its percentages', () => {
    const position = { line: 2, column: 0 }
    const span = { start: position, end: position }
    const branchMap = {
      '0': { type: 'if', line: 2, loc: span, locations: [span, span] },
    }
    const file = {
      path: 'src/a.ts',
      statementMap: {},
      s: {},
      branchMap,
      b: { '0': [1, 0] },
      fnMap: {},
      f: {},
    }

    const result = summary({ 'src/a.ts': file })

    expect(result).toBe('src/a.ts  lines 100%  branches 50%  functions 100%\n')
  })
})
