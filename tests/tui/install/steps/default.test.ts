import { describe, expect, it } from 'bun:test'
import { DefaultStep } from '../../../../src/tui/install/steps/default.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('DefaultStep', () => {
  it('when asked for the next step, returns confirm', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })

    const step = new DefaultStep(model)

    expect(step.nextStep).toBe('confirm')
  })

  it('when asked for its view, renders nothing', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })

    const rendered = new DefaultStep(model).View()

    expect(rendered).toBeNull()
  })

  it('when asked for its field, returns the env file input', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })

    const field = new DefaultStep(model).field()

    expect(field).toBe(model.directories.envFile)
  })
})
