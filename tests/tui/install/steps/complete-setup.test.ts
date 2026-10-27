import { describe, expect, it } from 'bun:test'
import { CompleteSetupStep } from '../../../../src/tui/install/steps/complete-setup.ts'
import { SetupProgress } from '../../../../src/tui/install/views/steps/setup-progress.tsx'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('CompleteSetupStep', () => {
  it('when asked for its name, returns completeSetup', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })

    const step = new CompleteSetupStep(model)

    expect(step.name).toBe('completeSetup')
  })

  it('when asked for the next step, stays on completeSetup', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })

    const step = new CompleteSetupStep(model)

    expect(step.nextStep).toBe('completeSetup')
  })

  it('when asked for its view, returns the setup progress', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })

    const step = new CompleteSetupStep(model)

    expect(step.View).toBe(SetupProgress)
  })

  it('when asked for its field, returns the env file input', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })

    const field = new CompleteSetupStep(model).field()

    expect(field).toBe(model.directories.envFile)
  })
})
