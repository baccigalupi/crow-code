import { describe, expect, it } from 'bun:test'
import { voidGuardViolations } from '../../../agents/style-checks/void-guard.ts'

describe('voidGuardViolations', () => {
  it('when a guard returns a void call, reports it', () => {
    const files = ['tests/support/fixtures/style-checks/void-guard.ts']

    const lines = voidGuardViolations(files)

    expect(lines).toEqual([
      'tests/support/fixtures/style-checks/void-guard.ts:7:28: guard clause return resolves to void/Promise<void>; call the function, then return',
    ])
  })

  it('when a guard returns a value call, does not report it', () => {
    const files = ['tests/support/fixtures/style-checks/value-guard.ts']

    const lines = voidGuardViolations(files)

    expect(lines).toEqual([])
  })

  it('when a guard returns a Promise<void> call, reports it', () => {
    const files = [
      'tests/support/fixtures/style-checks/void-guard/promise-void.ts',
    ]

    const lines = voidGuardViolations(files)

    expect(lines).toEqual([
      'tests/support/fixtures/style-checks/void-guard/promise-void.ts:4:20: guard clause return resolves to void/Promise<void>; call the function, then return',
    ])
  })

  it('when a guard returns an awaited void call, reports it', () => {
    const files = ['tests/support/fixtures/style-checks/void-guard/await.ts']

    const lines = voidGuardViolations(files)

    expect(lines).toEqual([
      'tests/support/fixtures/style-checks/void-guard/await.ts:4:26: guard clause return resolves to void/Promise<void>; call the function, then return',
    ])
  })

  it('when a guard returns a non-null asserted void call, reports it', () => {
    const files = ['tests/support/fixtures/style-checks/void-guard/bang.ts']

    const lines = voidGuardViolations(files)

    expect(lines).toEqual([
      'tests/support/fixtures/style-checks/void-guard/bang.ts:4:20: guard clause return resolves to void/Promise<void>; call the function, then return',
    ])
  })

  it('when a guard returns a cast void call, reports it', () => {
    const files = ['tests/support/fixtures/style-checks/void-guard/as.ts']

    const lines = voidGuardViolations(files)

    expect(lines).toEqual([
      'tests/support/fixtures/style-checks/void-guard/as.ts:4:20: guard clause return resolves to void/Promise<void>; call the function, then return',
    ])
  })

  it('when a guard returns an optional-chained void call, reports it', () => {
    const files = ['tests/support/fixtures/style-checks/void-guard/optional.ts']

    const lines = voidGuardViolations(files)

    expect(lines).toEqual([
      'tests/support/fixtures/style-checks/void-guard/optional.ts:4:30: guard clause return resolves to void/Promise<void>; call the function, then return',
    ])
  })

  it('when an else-if branch returns a void call, does not report it', () => {
    const files = ['tests/support/fixtures/style-checks/void-guard/else-if.ts']

    const lines = voidGuardViolations(files)

    expect(lines).toEqual([])
  })

  it('when an if with an else returns a void call, does not report it', () => {
    const files = ['tests/support/fixtures/style-checks/void-guard/else.ts']

    const lines = voidGuardViolations(files)

    expect(lines).toEqual([])
  })

  it('when a multi-statement block returns a void call, does not report it', () => {
    const files = [
      'tests/support/fixtures/style-checks/void-guard/multi-statement.ts',
    ]

    const lines = voidGuardViolations(files)

    expect(lines).toEqual([])
  })
})
