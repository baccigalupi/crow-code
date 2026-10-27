import { describe, expect, it } from 'bun:test'
import { AllowedLocalScriptsStep } from '../../../../src/tui/install/steps/allowed-local-scripts.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('AllowedLocalScriptsStep', () => {
  it('when finished, moves on to the provider name', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('allowedLocalScripts')

    const step = new AllowedLocalScriptsStep(model)

    expect(step.nextStep).toBe('providerName')
  })
})
