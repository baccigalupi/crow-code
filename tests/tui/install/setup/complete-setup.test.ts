import { describe, expect, it, spyOn } from 'bun:test'
import type { SetupTaskStatus } from '../../../../src/tui/install/types.ts'
import { CompleteSetup } from '../../../../src/tui/install/setup/complete-setup.ts'
import { buildInstallStore } from '../../../support/install-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('CompleteSetup', () => {
  it('when the step becomes completeSetup, starts the first task', () => {
    const installData = buildInstallStore()
    installData.step.value = 'confirm'
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const dispose = new CompleteSetup({
      applicationData,
      installData,
    }).subscribe()

    installData.step.value = 'completeSetup'

    expect(mkdir).toHaveBeenCalledTimes(1)
    dispose()
  })

  it('when the step becomes completeSetup, publishes every task label as pending', () => {
    const installData = buildInstallStore()
    installData.step.value = 'confirm'
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockImplementation(
      () => new Promise<void>(() => {}),
    )
    const dispose = new CompleteSetup({
      applicationData,
      installData,
    }).subscribe()

    installData.step.value = 'completeSetup'

    expect(installData.setupTasks.peek()).toEqual([
      {
        id: 'LocalConfigTask',
        label: 'Writing config to .crow/config.json',
        done: false,
      },
      { id: 'GlobalDirectoryTask', label: 'Creating ~/.crow', done: false },
    ])
    dispose()
  })

  it('when a task finishes, marks it done before the next one starts', async () => {
    const installData = buildInstallStore()
    installData.step.value = 'confirm'
    const applicationData = mockApplicationData()
    const statusesAtStart: Array<readonly SetupTaskStatus[]> = []
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockImplementation(
      () => {
        statusesAtStart.push(installData.setupTasks.peek())
        return Promise.resolve()
      },
    )
    spyOn(applicationData.filesystem, 'writeTextFile').mockResolvedValue()
    const setup = new CompleteSetup({ applicationData, installData })
    const dispose = setup.subscribe()

    installData.step.value = 'completeSetup'
    await setup.finished()

    expect(statusesAtStart[1]).toEqual([
      {
        id: 'LocalConfigTask',
        label: 'Writing config to .crow/config.json',
        done: true,
      },
      { id: 'GlobalDirectoryTask', label: 'Creating ~/.crow', done: false },
    ])
    dispose()
  })

  it('when every task finishes, moves to done', async () => {
    const installData = buildInstallStore()
    installData.step.value = 'confirm'
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockResolvedValue()
    spyOn(applicationData.filesystem, 'writeTextFile').mockResolvedValue()
    const setup = new CompleteSetup({ applicationData, installData })
    const dispose = setup.subscribe()

    installData.step.value = 'completeSetup'
    await setup.finished()

    expect(installData.step.peek()).toBe('done')
    dispose()
  })

  it('when the step is not completeSetup, starts no task', () => {
    const installData = buildInstallStore()
    installData.step.value = 'envFile'
    const applicationData = mockApplicationData()
    const mkdir = spyOn(applicationData.filesystem, 'mkdirWithParents')
    const dispose = new CompleteSetup({
      applicationData,
      installData,
    }).subscribe()

    installData.step.value = 'confirm'

    expect(mkdir).not.toHaveBeenCalled()
    expect(installData.step.peek()).toBe('confirm')
    dispose()
  })
})
