import { beforeEach, describe, expect, it } from 'bun:test'
import { readFileSync, rmSync } from 'node:fs'
import { writeRaw } from '../../../agents/coverage/raw-store.ts'
import { writeReport } from '../../../agents/coverage/write-report.ts'

describe('writeReport', () => {
  beforeEach(() => {
    rmSync('tests/support/fixtures/coverage-raw/write-report', {
      recursive: true,
      force: true,
    })
  })

  it('when two raw files exist, writes merged lcov', () => {
    const dir = 'tests/support/fixtures/coverage-raw/write-report'
    const position = { line: 2, column: 0 }
    const span = { start: position, end: position }
    const branchMap = {
      '0': { type: 'if', line: 2, loc: span, locations: [span, span] },
    }
    const empty = { statementMap: {}, s: {}, branchMap, fnMap: {}, f: {} }
    const first = { path: 'src/a.ts', ...empty, b: { '0': [1, 0] } }
    const second = { path: 'src/a.ts', ...empty, b: { '0': [2, 0] } }
    writeRaw(`${dir}/raw`, '1', { 'src/a.ts': first })
    writeRaw(`${dir}/raw`, '2', { 'src/a.ts': second })

    writeReport(dir)

    const lcov = readFileSync(`${dir}/lcov.info`, 'utf8')
    expect(lcov).toContain('BRDA:2,0,0,3\n')
  })

  it('when raw is empty, throws', () => {
    const dir = 'tests/support/fixtures/coverage-raw/write-report'

    const act = () => writeReport(dir)

    expect(act).toThrow(
      'No coverage data in tests/support/fixtures/coverage-raw/write-report/raw',
    )
  })
})
