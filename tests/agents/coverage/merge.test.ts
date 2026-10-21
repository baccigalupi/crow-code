import { describe, expect, it } from 'bun:test'
import { mergeCoverage } from '../../../agents/coverage/merge.ts'

describe('mergeCoverage', () => {
  it('when two objects share a file, sums its counters', () => {
    const position = { line: 1, column: 0 }
    const span = { start: position, end: position }
    const fnMap = { '0': { name: 'one', decl: span, loc: span, line: 1 } }
    const empty = { statementMap: {}, s: {}, branchMap: {}, b: {}, fnMap }
    const first = { 'src/a.ts': { path: 'src/a.ts', ...empty, f: { '0': 1 } } }
    const second = { 'src/a.ts': { path: 'src/a.ts', ...empty, f: { '0': 2 } } }

    const result = mergeCoverage([first, second])

    expect(result['src/a.ts'].f).toEqual({ '0': 3 })
  })

  it('when a file is in only one object, keeps it', () => {
    const empty = {
      statementMap: {},
      s: {},
      branchMap: {},
      b: {},
      fnMap: {},
      f: {},
    }
    const first = { 'src/a.ts': { path: 'src/a.ts', ...empty } }
    const second = { 'src/b.ts': { path: 'src/b.ts', ...empty } }

    const result = mergeCoverage([first, second])

    expect(Object.keys(result)).toEqual(['src/a.ts', 'src/b.ts'])
  })

  it('when the list is empty, returns an empty object', () => {
    const list: Record<string, never>[] = []

    const result = mergeCoverage(list)

    expect(result).toEqual({})
  })
})
