import { describe, expect, it } from 'bun:test'
import { ProviderDraft } from '../../../../src/tui/install/steps/provider-draft.ts'
import { buildUserInputStore } from '../../../support/user-input-store.ts'

describe('ProviderDraft', () => {
  it('when committed with a credential, buffers it under the upper snake api key var', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.providerName.value = { text: 'Open Router', cursor: 11 }
    userInputStore.providerUrl.value = { text: 'https://o', cursor: 9 }
    userInputStore.providerCredentials.value = { text: 'sk-1', cursor: 4 }
    const draft = new ProviderDraft(userInputStore)

    draft.commit()

    expect(userInputStore.envBuffer.peek()).toEqual({
      OPEN_ROUTER_API_KEY: 'sk-1',
    })
  })
})
