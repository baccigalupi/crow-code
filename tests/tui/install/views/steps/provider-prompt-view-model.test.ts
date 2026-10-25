import { describe, expect, it } from 'bun:test'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'
import { providerPromptViewModel } from '../../../../../src/tui/install/views/steps/provider-prompt-view-model.ts'

describe('providerPromptViewModel', () => {
  it('when one provider is finished, titles the draft as the second', () => {
    const props = {
      step: 'providerName' as const,
      providers: [{ name: 'nous', url: 'https://n' }],
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
    }

    const view = providerPromptViewModel(props)

    expect(view.title).toBe('Provider 2')
  })

  it('when on the url step, marks name done, url active and credentials pending', () => {
    const props = {
      step: 'providerUrl' as const,
      providers: [],
      providerName: insertText(emptyText(), 'or'),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
    }

    const view = providerPromptViewModel(props)

    expect(view.nameStatus).toBe('done')
    expect(view.urlStatus).toBe('active')
    expect(view.credentialsStatus).toBe('pending')
  })
})
