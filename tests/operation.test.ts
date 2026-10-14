import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { spy } from '@std/testing/mock'
import { Operation } from '../src/operation.ts'
import { mockApplicationData } from './support/mock-application-data.ts'

describe('Operation', () => {
  it('when an earlier sub-operation failed, runIndependentSubOperation still runs the next one', async () => {
    class Child extends Operation<{ ok: boolean }> {
      protected logPrefix = 'Child: '
      ran = false

      run() {
        this.ran = true
        if (!this.operationArguments.ok) this.fail('child broke')
        return Promise.resolve(this)
      }
    }
    class Parent extends Operation<Record<string, never>> {
      protected logPrefix = 'Parent: '
      second = this.child(true)

      async run() {
        await this.runSubOperation(this.child(false))
        await this.runIndependentSubOperation(this.second)
        return this
      }

      private child(ok: boolean) {
        return new Child({
          applicationData: this.applicationData,
          operationArguments: { ok },
        })
      }
    }
    const parent = new Parent({
      applicationData: mockApplicationData(),
      operationArguments: {},
    })

    await parent.run()

    expect(parent.second.ran).toBe(true)
    expect(parent.success()).toBe(false)
  })

  it('when an independent sub-operation fails, the parent does not fail or log', async () => {
    class Child extends Operation<Record<string, never>> {
      protected logPrefix = 'Child: '

      run() {
        this.fail('child broke')
        return Promise.resolve(this)
      }
    }
    class Parent extends Operation<Record<string, never>> {
      protected logPrefix = 'Parent: '

      async run() {
        await this.runIndependentSubOperation(
          new Child({
            applicationData: this.applicationData,
            operationArguments: {},
          }),
        )
        return this
      }
    }
    const applicationData = mockApplicationData()
    using loggerErrorSpy = spy(applicationData.logger(), 'error')
    const parent = new Parent({ applicationData, operationArguments: {} })

    await parent.run()

    expect(parent.success()).toBe(true)
    expect(loggerErrorSpy.calls.length).toBe(1)
    expect(loggerErrorSpy.calls[0].args[0]).toBe('Child: child broke')
  })
})
