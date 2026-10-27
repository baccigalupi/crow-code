import { describe, expect, it } from 'bun:test'
import { ProviderUrlStep } from '../../../../src/tui/install/steps/provider-url.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ProviderUrlStep', () => {
  it('when asked for its field, returns the provider url input', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('providerUrl')

    const step = new ProviderUrlStep(model)

    expect(step.name).toBe('providerUrl')
    expect(step.nextStep).toBe('providerCredentials')
    expect(step.field()).toBe(model.providers.providerUrl)
  })

  it('when focused forward, moves to the credentials step', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('providerUrl')

    new ProviderUrlStep(model).focus(1)

    expect(model.step.current.peek()).toBe('providerCredentials')
  })

  it('when cancelled, leaves the provider loop for confirm', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('providerUrl')

    new ProviderUrlStep(model).cancel()

    expect(model.step.current.peek()).toBe('confirm')
  })
})
