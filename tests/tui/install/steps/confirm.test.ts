import { describe, expect, it } from 'bun:test'
import { ConfirmStep } from '../../../../src/tui/install/steps/confirm.ts'
import { ConfirmPrompt } from '../../../../src/tui/install/views/steps/confirm-prompt.tsx'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ConfirmStep', () => {
  it('when asked for the next step, returns completeSetup', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('confirm')

    const step = new ConfirmStep(model)

    expect(step.nextStep).toBe('completeSetup')
  })

  it('when asked for its view, returns the confirm prompt', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('confirm')

    const step = new ConfirmStep(model)

    expect(step.View).toBe(ConfirmPrompt)
  })

  it('when asked for its field, returns the env file input', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('confirm')

    const field = new ConfirmStep(model).field()

    expect(field).toBe(model.directories.envFile)
  })
})
