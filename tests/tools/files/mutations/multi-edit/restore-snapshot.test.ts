import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { restoreSnapshot } from '../../../../../src/tools/files/mutations/multi-edit/restore-snapshot.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import {
  clearDirectory,
  fixturesDirectory,
} from '../../../../support/fixtures.ts'

describe('RestoreSnapshot', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'restore-snapshot')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'restore-snapshot')))

  it('writes the captured text back to each path', async () => {
    const directory = join(fixturesDirectory, 'restore-snapshot')
    Deno.mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    Deno.writeTextFileSync(path, 'changed\n')

    const operation = restoreSnapshot({
      applicationData: mockApplicationData(),
      operationArguments: { entries: [[path, 'one\n']] },
    })
    await operation.run()

    expect(operation.success()).toBe(true)
    expect(Deno.readTextFileSync(path)).toBe('one\n')
  })

  it('when a file cannot be rewritten, fails naming its path', async () => {
    const directory = join(fixturesDirectory, 'restore-snapshot')
    const path = join(directory, 'alpha.txt')

    const operation = restoreSnapshot({
      applicationData: mockApplicationData(),
      operationArguments: { entries: [[path, 'one\n']] },
    })
    await operation.run()

    expect(operation.success()).toBe(false)
    expect(operation.reason).toBe(`failed to restore: ${path}`)
  })
})
