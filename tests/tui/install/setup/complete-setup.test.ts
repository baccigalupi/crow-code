import { describe, expect, it } from 'bun:test'
import { CompleteSetup } from '../../../../src/tui/install/setup/complete-setup.ts'
import { buildInstallStore } from '../../../support/install-store.ts'

describe('CompleteSetup', () => {
  it('when the step becomes completeSetup, starts the first task', () => {
    const installData = buildInstallStore()
    installData.step.value = 'confirm'
    const started: string[] = []
    const first = {
      run: () => {
        started.push('first')
        return new Promise<void>(() => {})
      },
    }
    const second = {
      run: () => {
        started.push('second')
        return new Promise<void>(() => {})
      },
    }
    const dispose = new CompleteSetup({
      installData,
      tasks: [first, second],
    }).subscribe()

    installData.step.value = 'completeSetup'

    expect(started).toEqual(['first'])
    dispose()
  })

  it('when a task finishes, starts the next and then moves to done', async () => {
    const installData = buildInstallStore()
    installData.step.value = 'confirm'
    const started: string[] = []
    const finish: Array<() => void> = []
    const first = {
      run: () => {
        started.push('first')
        return new Promise<void>((resolve) => finish.push(resolve))
      },
    }
    const second = {
      run: () => {
        started.push('second')
        return new Promise<void>((resolve) => finish.push(resolve))
      },
    }
    const dispose = new CompleteSetup({
      installData,
      tasks: [first, second],
    }).subscribe()

    installData.step.value = 'completeSetup'
    finish[0]()
    await Promise.resolve()
    await Promise.resolve()
    const startedAfterFirst = [...started]
    finish[1]()
    await Promise.resolve()
    await Promise.resolve()

    expect(startedAfterFirst).toEqual(['first', 'second'])
    expect(installData.step.peek()).toBe('done')
    dispose()
  })

  it('when the step is not completeSetup, starts no task', () => {
    const installData = buildInstallStore()
    installData.step.value = 'envFile'
    const started: string[] = []
    const first = {
      run: () => {
        started.push('first')
        return Promise.resolve()
      },
    }
    const dispose = new CompleteSetup({
      installData,
      tasks: [first],
    }).subscribe()

    installData.step.value = 'confirm'

    expect(started).toEqual([])
    expect(installData.step.peek()).toBe('confirm')
    dispose()
  })
})
