import { describe, expect, it } from 'bun:test'
import { DoneStep } from '../../../../src/tui/install/steps/done.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('DoneStep', () => {
  it('when asked for the next step, returns done', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('done')

    const step = new DoneStep(model)

    expect(step.nextStep).toBe('done')
  })

  it('when asked for its field, returns the env file input', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('done')

    const field = new DoneStep(model).field()

    expect(field).toBe(model.directories.envFile)
  })
})
