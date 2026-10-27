import { describe, expect, it } from 'bun:test'
import { ConfirmStep } from '../../../../src/tui/install/steps/confirm.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ConfirmStep', () => {
  it('when asked for the next step, returns completeSetup', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('confirm')

    const step = new ConfirmStep(model)

    expect(step.nextStep).toBe('completeSetup')
  })

  it('when asked for its field, returns the env file input', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('confirm')

    const field = new ConfirmStep(model).field()

    expect(field).toBe(model.directories.envFile)
  })
})
