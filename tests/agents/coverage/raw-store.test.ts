import { beforeEach, describe, it } from 'node:test'
import { rmSync } from 'node:fs'
import { expect } from '@std/expect'
import {
  clearRaw,
  readAllRaw,
  writeRaw,
} from '../../../agents/coverage/raw-store.ts'

describe('raw-store', () => {
  beforeEach(() => {
    rmSync('tests/support/fixtures/coverage-raw/store', {
      recursive: true,
      force: true,
    })
  })

  it('when two ids are written, reads both back', () => {
    const dir = 'tests/support/fixtures/coverage-raw/store'
    writeRaw(dir, '1', { 'src/a.ts': { path: 'src/a.ts' } })
    writeRaw(dir, '2', { 'src/b.ts': { path: 'src/b.ts' } })

    const result = readAllRaw(dir)

    expect(result).toEqual([
      { 'src/a.ts': { path: 'src/a.ts' } },
      { 'src/b.ts': { path: 'src/b.ts' } },
    ])
  })

  it('when the same id is written twice, keeps the latest', () => {
    const dir = 'tests/support/fixtures/coverage-raw/store'
    writeRaw(dir, '1', { 'src/a.ts': { path: 'old' } })
    writeRaw(dir, '1', { 'src/a.ts': { path: 'new' } })

    const result = readAllRaw(dir)

    expect(result).toEqual([{ 'src/a.ts': { path: 'new' } }])
  })

  it('when cleared, reads back nothing', () => {
    const dir = 'tests/support/fixtures/coverage-raw/store'
    writeRaw(dir, '1', { 'src/a.ts': { path: 'src/a.ts' } })
    clearRaw(dir)

    const result = readAllRaw(dir)

    expect(result).toEqual([])
  })

  it('when the directory does not exist, returns an empty list', () => {
    const dir = 'tests/support/fixtures/coverage-raw/store'

    const result = readAllRaw(dir)

    expect(result).toEqual([])
  })
})
