import { describe, expect, it } from 'bun:test'
import { ProviderNameStep } from '../../../../src/tui/install/steps/provider-name.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ProviderNameStep', () => {
  it('when asked for its field, returns the provider name input', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('providerName')

    const step = new ProviderNameStep(model)

    expect(step.name).toBe('providerName')
    expect(step.nextStep).toBe('providerUrl')
    expect(step.field()).toBe(model.providers.providerName)
  })
})
