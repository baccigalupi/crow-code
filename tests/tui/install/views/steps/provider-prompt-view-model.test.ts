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

    expect(view.fields).toEqual([
      {
        id: 'providerName',
        label: 'Name',
        input: { text: 'or', cursor: 2 },
        status: 'done',
        masked: false,
      },
      {
        id: 'providerUrl',
        label: 'Url',
        input: { text: '', cursor: 0 },
        status: 'active',
        masked: false,
      },
      {
        id: 'providerCredentials',
        label: 'API key',
        input: { text: '', cursor: 0 },
        status: 'pending',
        masked: true,
      },
    ])
  })
})
