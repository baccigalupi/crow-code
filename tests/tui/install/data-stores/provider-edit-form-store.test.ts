import { describe, expect, it } from 'bun:test'
import { ProviderEditFormStore } from '../../../../src/tui/install/data-stores/provider-edit-form-store.ts'

describe('ProviderEditFormStore', () => {
  it('when cleared, empties name, url and credentials', () => {
    const form = new ProviderEditFormStore()
    form.providerName.insert('a')
    form.providerUrl.insert('b')
    form.providerCredentials.insert('c')

    form.clear()

    expect(form.providerName.text.peek()).toEqual({ text: '', cursor: 0 })
    expect(form.providerUrl.text.peek()).toEqual({ text: '', cursor: 0 })
    expect(form.providerCredentials.text.peek()).toEqual({
      text: '',
      cursor: 0,
    })
  })

  it('values lists the three typed texts', () => {
    const form = new ProviderEditFormStore()
    form.providerName.insert('n')
    form.providerUrl.insert('u')

    const values = form.values.peek()

    expect(values).toEqual({
      providerName: { text: 'n', cursor: 1 },
      providerUrl: { text: 'u', cursor: 1 },
      providerCredentials: { text: '', cursor: 0 },
    })
  })

  it('provider() is the typed name and url, credential() the typed key', () => {
    const form = new ProviderEditFormStore()
    form.providerName.insert('Open Router')
    form.providerUrl.insert('https://o')
    form.providerCredentials.insert('sk-1')

    const provider = form.provider()
    const credential = form.credential()

    expect(provider).toEqual({ name: 'Open Router', url: 'https://o' })
    expect(credential).toBe('sk-1')
  })

  it('when on the url, the name is answered, the url live and the key upcoming', () => {
    const form = new ProviderEditFormStore()

    const states = form.fieldStates('providerUrl')

    expect(states).toEqual([
      { name: 'providerName', state: 'answered' },
      { name: 'providerUrl', state: 'live' },
      { name: 'providerCredentials', state: 'upcoming' },
    ])
  })
})
