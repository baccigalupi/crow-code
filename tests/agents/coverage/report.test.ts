import { describe, expect, it } from 'bun:test'
import { lcov } from '../../../agents/coverage/report.ts'

describe('lcov', () => {
  it('when file has functions, emits their names, counts and totals', () => {
    const one = { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } }
    const two = { start: { line: 3, column: 0 }, end: { line: 3, column: 5 } }
    const coverage = {
      '/r/src/a.ts': {
        path: '/r/src/a.ts',
        statementMap: {},
        s: {},
        branchMap: {},
        b: {},
        fnMap: {
          '0': { name: 'one', decl: one, loc: one, line: 1 },
          '1': { name: 'two', decl: two, loc: two, line: 3 },
        },
        f: { '0': 1, '1': 0 },
      },
    }

    const result = lcov(coverage)

    expect(result).toBe(
      'SF:/r/src/a.ts\n' +
        'FN:1,one\n' +
        'FN:3,two\n' +
        'FNDA:1,one\n' +
        'FNDA:0,two\n' +
        'FNF:2\n' +
        'FNH:1\n' +
        'BRF:0\n' +
        'BRH:0\n' +
        'LF:0\n' +
        'LH:0\n' +
        'end_of_record\n',
    )
  })

  it('when file has statements, emits line counts and totals', () => {
    const one = { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } }
    const two = { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } }
    const three = { start: { line: 3, column: 0 }, end: { line: 3, column: 5 } }
    const coverage = {
      '/r/src/a.ts': {
        path: '/r/src/a.ts',
        statementMap: { '0': one, '1': two, '2': three },
        s: { '0': 1, '1': 4, '2': 0 },
        branchMap: {},
        b: {},
        fnMap: {},
        f: {},
      },
    }

    const result = lcov(coverage)

    expect(result).toBe(
      'SF:/r/src/a.ts\n' +
        'FNF:0\n' +
        'FNH:0\n' +
        'BRF:0\n' +
        'BRH:0\n' +
        'DA:1,1\n' +
        'DA:2,4\n' +
        'DA:3,0\n' +
        'LF:3\n' +
        'LH:2\n' +
        'end_of_record\n',
    )
  })

  it('when file has a branch, emits each arm and totals', () => {
    const span = { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } }
    const coverage = {
      '/r/src/a.ts': {
        path: '/r/src/a.ts',
        statementMap: {},
        s: {},
        branchMap: {
          '0': { type: 'if', line: 2, loc: span, locations: [span, span] },
        },
        b: { '0': [3, 0] },
        fnMap: {},
        f: {},
      },
    }

    const result = lcov(coverage)

    expect(result).toBe(
      'SF:/r/src/a.ts\n' +
        'FNF:0\n' +
        'FNH:0\n' +
        'BRDA:2,0,0,3\n' +
        'BRDA:2,0,1,0\n' +
        'BRF:2\n' +
        'BRH:1\n' +
        'LF:0\n' +
        'LH:0\n' +
        'end_of_record\n',
    )
  })

  it('when there are two files, emits a record for each', () => {
    const empty = {
      statementMap: {},
      s: {},
      branchMap: {},
      b: {},
      fnMap: {},
      f: {},
    }
    const coverage = {
      '/r/src/a.ts': { path: '/r/src/a.ts', ...empty },
      '/r/src/b.ts': { path: '/r/src/b.ts', ...empty },
    }

    const result = lcov(coverage)

    expect(result).toBe(
      'SF:/r/src/a.ts\nFNF:0\nFNH:0\nBRF:0\nBRH:0\nLF:0\nLH:0\n' +
        'end_of_record\n' +
        'SF:/r/src/b.ts\nFNF:0\nFNH:0\nBRF:0\nBRH:0\nLF:0\nLH:0\n' +
        'end_of_record\n',
    )
  })
})
