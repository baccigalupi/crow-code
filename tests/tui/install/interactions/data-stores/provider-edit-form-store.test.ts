import { describe, expect, it } from 'bun:test'
import { ProviderEditFormStore } from '../../../../../src/tui/install/interactions/data-stores/provider-edit-form-store.ts'

describe('ProviderEditFormStore', () => {
  it('when cleared, empties name, url and credentials', () => {
    const form = new ProviderEditFormStore()
    form.providerName.replace('a')
    form.providerUrl.replace('b')
    form.providerCredentials.replace('c')

    form.clear()

    expect(form.providerName.text.peek()).toBe('')
    expect(form.providerUrl.text.peek()).toBe('')
    expect(form.providerCredentials.text.peek()).toBe('')
  })

  it('values lists the three typed texts', () => {
    const form = new ProviderEditFormStore()
    form.providerName.replace('n')
    form.providerUrl.replace('u')

    const values = form.values.peek()

    expect(values).toEqual({
      providerName: 'n',
      providerUrl: 'u',
      providerCredentials: '',
    })
  })

  it('provider() is the typed name and url, credential() the typed key', () => {
    const form = new ProviderEditFormStore()
    form.providerName.replace('Open Router')
    form.providerUrl.replace('https://o')
    form.providerCredentials.replace('sk-1')

    const provider = form.provider()
    const credential = form.credential()

    expect(provider).toEqual({ name: 'Open Router', url: 'https://o' })
    expect(credential).toBe('sk-1')
  })

  it('when on the url, the name is answered, the url live and the key upcoming', () => {
    const form = new ProviderEditFormStore()

    const states = [
      form.fieldState('providerName', 'providerUrl'),
      form.fieldState('providerUrl', 'providerUrl'),
      form.fieldState('providerCredentials', 'providerUrl'),
    ]

    expect(states).toEqual(['answered', 'live', 'upcoming'])
  })
})
