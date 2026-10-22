import { beforeEach, describe, expect, it } from 'bun:test'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { run } from '../../../agents/coverage/cli.ts'
import { writeRaw } from '../../../agents/coverage/raw-store.ts'

describe('run', () => {
  beforeEach(() => {
    rmSync('tests/support/fixtures/coverage-raw/cli', {
      recursive: true,
      force: true,
    })
  })

  it('when lcov, writes lcov', () => {
    const dir = 'tests/support/fixtures/coverage-raw/cli'
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
    writeRaw(`${dir}/raw`, '1', { 'src/a.ts': file })

    run('lcov', dir)

    const lcov = readFileSync(`${dir}/lcov.info`, 'utf8')
    expect(lcov).toContain('SF:src/a.ts\n')
  })

  it('when html, writes index.html', () => {
    const dir = 'tests/support/fixtures/coverage-raw/cli'
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
    writeRaw(`${dir}/raw`, '1', { 'src/a.ts': file })

    run('html', dir)

    expect(existsSync(`${dir}/html/index.html`)).toBe(true)
  })

  it('when no command, returns the summary', () => {
    const dir = 'tests/support/fixtures/coverage-raw/cli'
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
    writeRaw(`${dir}/raw`, '1', { 'src/a.ts': file })

    const result = run(undefined, dir)

    expect(result).toBe('src/a.ts  lines 100%  branches 50%  functions 100%\n')
  })
})
