import { describe, expect, it } from 'bun:test'
import { ProviderCredentialsStep } from '../../../../src/tui/install/steps/provider-credentials.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ProviderCredentialsStep', () => {
  it('when asked for its field, returns the provider credentials input', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('providerCredentials')

    const step = new ProviderCredentialsStep(model)

    expect(step.name).toBe('providerCredentials')
    expect(step.nextStep).toBe('providerName')
    expect(step.field()).toBe(model.providers.providerCredentials)
  })

  it('when cancelled, drops the typed credential and moves to confirm', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.providers.providerName.insert('nous')
    model.providers.providerUrl.insert('https://n')
    model.providers.providerCredentials.insert('sk-1')
    model.step.goTo('providerCredentials')
    const step = new ProviderCredentialsStep(model)

    step.cancel()

    expect(model.step.current.peek()).toBe('confirm')
    expect(model.providers.providerCredentials.text.peek()).toEqual({
      text: '',
      cursor: 0,
    })
    expect(model.providers.envBuffer.peek()).toEqual({})
  })

  it('when advanced, commits the provider and starts another', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.providers.providerName.insert('nous')
    model.step.goTo('providerCredentials')
    const step = new ProviderCredentialsStep(model)

    step.advance()

    expect(model.providers.providers.peek()).toEqual([
      { name: 'nous', url: '' },
    ])
    expect(model.step.current.peek()).toBe('providerName')
  })
})
