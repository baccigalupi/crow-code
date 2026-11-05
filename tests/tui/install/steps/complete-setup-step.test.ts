import { describe, expect, it, spyOn } from 'bun:test'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { CompleteSetupStep } from '../../../../src/tui/install/steps/complete-setup-step.tsx'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('CompleteSetupStep', () => {
  it('when asked for its name, is completeSetup', () => {
    const step = new CompleteSetupStep()

    const name = step.name

    expect(name).toBe('completeSetup')
  })

  it('when entered, setup starts and its tasks are listed', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const store = new DataStore({ applicationData })
    const step = new CompleteSetupStep()

    step.entered(store)

    expect(mkdir.mock.calls).toEqual([['.crow']])
    expect(store.progress.tasks.peek()).toEqual([
      {
        id: 'LocalConfigTask',
        label: 'Writing config to .crow/config.json',
        done: false,
        error: '',
      },
      {
        id: 'GlobalDirectoryTask',
        label: 'Creating ~/.crow',
        done: false,
        error: '',
      },
    ])
  })
})
