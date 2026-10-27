import { describe, expect, it } from 'bun:test'
import { AdditionalWriteStep } from '../../../../src/tui/install/steps/additional-write.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('AdditionalWriteStep', () => {
  it('when asked for its field, returns the additional write input', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('additionalWrite')

    const step = new AdditionalWriteStep(model)

    expect(step.name).toBe('additionalWrite')
    expect(step.nextStep).toBe('escalateRead')
    expect(step.field()).toBe(model.permissions.additionalWrite)
  })
})
