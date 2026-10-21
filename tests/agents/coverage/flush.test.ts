import { beforeEach, describe, it } from 'node:test'
import { readFileSync, rmSync } from 'node:fs'
import { expect } from '@std/expect'
import { flush } from '../../../agents/coverage/flush.ts'

describe('flush', () => {
  beforeEach(() => {
    rmSync('tests/support/fixtures/coverage-raw/flush', {
      recursive: true,
      force: true,
    })
  })

  it('when called, writes lcov with branch totals', () => {
    const dir = 'tests/support/fixtures/coverage-raw/flush'
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

    flush(dir, '1', { 'src/a.ts': file })

    const lcov = readFileSync(`${dir}/lcov.info`, 'utf8')
    expect(lcov).toContain('SF:src/a.ts\n')
    expect(lcov).toContain('BRF:2\nBRH:1\n')
  })

  it('when another process already flushed, merges both', () => {
    const dir = 'tests/support/fixtures/coverage-raw/flush'
    const position = { line: 2, column: 0 }
    const span = { start: position, end: position }
    const branchMap = {
      '0': { type: 'if', line: 2, loc: span, locations: [span, span] },
    }
    const empty = { statementMap: {}, s: {}, branchMap, fnMap: {}, f: {} }
    const first = { path: 'src/a.ts', ...empty, b: { '0': [1, 0] } }
    const second = { path: 'src/a.ts', ...empty, b: { '0': [2, 0] } }

    flush(dir, '1', { 'src/a.ts': first })
    flush(dir, '2', { 'src/a.ts': second })

    const lcov = readFileSync(`${dir}/lcov.info`, 'utf8')
    expect(lcov).toContain('BRDA:2,0,0,3\n')
  })
})
