import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { takeSnapshot } from '../../../../../src/tools/files/mutations/multi-edit/take-snapshot.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import {
  clearDirectory,
  fixturesDirectory,
} from '../../../../support/fixtures.ts'

describe('TakeSnapshot', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'take-snapshot')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'take-snapshot')))

  it('captures the text of every path', async () => {
    const directory = join(fixturesDirectory, 'take-snapshot')
    mkdirSync(directory, { recursive: true })
    const alpha = join(directory, 'alpha.txt')
    const beta = join(directory, 'beta.txt')
    writeFileSync(alpha, 'one\n')
    writeFileSync(beta, 'two\n')

    const operation = takeSnapshot({
      applicationData: mockApplicationData(),
      operationArguments: { paths: [alpha, beta] },
    })
    await operation.run()

    expect(operation.success()).toBe(true)
    expect(operation.result()).toEqual([[alpha, 'one\n'], [beta, 'two\n']])
  })

  it('when a file cannot be read, fails with the read error', async () => {
    const directory = join(fixturesDirectory, 'take-snapshot')
    const missing = join(directory, 'missing.txt')

    const operation = takeSnapshot({
      applicationData: mockApplicationData(),
      operationArguments: { paths: [missing] },
    })
    await operation.run()

    expect(operation.success()).toBe(false)
    expect(operation.reason).toContain('ENOENT: no such file or directory')
    expect(operation.result()).toEqual([])
  })
})
