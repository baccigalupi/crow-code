import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { spy } from '@std/testing/mock'
import type { AsyncOperation } from '../../src/types.ts'
import { SubOperations } from '../../src/application-data/sub-operations.ts'

describe('SubOperations', () => {
  it('reports each failed operation with its action and reason', async () => {
    const errorSpy = spy()
    const operations = new SubOperations()
    const failed = {
      reason: 'the file is missing',
      run: () => Promise.resolve(failed),
      success: () => false,
    } as AsyncOperation

    await operations.run(failed, 'load the config')
    operations.reportFailures(errorSpy)

    expect(errorSpy.calls).toHaveLength(1)
    expect(errorSpy.calls[0].args[0]).toBe(
      'Could not load the config: the file is missing',
    )
  })

  it('reports nothing when every operation succeeds', async () => {
    const errorSpy = spy()
    const operations = new SubOperations()
    const succeeded = {
      reason: '',
      run: () => Promise.resolve(succeeded),
      success: () => true,
    } as AsyncOperation

    await operations.run(succeeded, 'load the config')
    operations.reportFailures(errorSpy)

    expect(errorSpy.calls).toHaveLength(0)
  })
})
