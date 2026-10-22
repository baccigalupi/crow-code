import { beforeEach, describe, expect, it } from 'bun:test'
import { readFileSync, rmSync } from 'node:fs'
import { writeRaw } from '../../../agents/coverage/raw-store.ts'
import { writeHtml } from '../../../agents/coverage/write-html.ts'

describe('writeHtml', () => {
  beforeEach(() => {
    rmSync('tests/support/fixtures/coverage-raw/write-html', {
      recursive: true,
      force: true,
    })
  })

  it('when raw exists, writes index.html naming the file', () => {
    const dir = 'tests/support/fixtures/coverage-raw/write-html'
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

    writeHtml(dir)

    const html = readFileSync(`${dir}/html/index.html`, 'utf8')
    expect(html).toContain('a.ts')
  })
})
