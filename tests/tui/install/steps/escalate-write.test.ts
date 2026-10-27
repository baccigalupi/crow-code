import { describe, expect, it } from 'bun:test'
import { EscalateWriteStep } from '../../../../src/tui/install/steps/escalate-write.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('EscalateWriteStep', () => {
  it('when asked for its field, returns the escalate write input', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('escalateWrite')

    const field = new EscalateWriteStep(model).field()

    expect(field).toBe(model.permissions.escalateWrite)
  })
})
