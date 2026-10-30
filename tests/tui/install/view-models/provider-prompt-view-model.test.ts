import { describe, expect, it } from 'bun:test'
import { ProviderPromptViewModel } from '../../../../src/tui/install/view-models/provider-prompt-view-model.ts'
import { emptyText, insertText } from '../../../../src/tui/input-text.ts'

describe('ProviderPromptViewModel', () => {
  it('when one provider is saved, titles the block Provider 2', () => {
    const viewModel = new ProviderPromptViewModel()

    const props = viewModel.props({
      step: 'providerName',
      providers: [{ name: 'nous', url: 'https://n' }],
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
    })

    expect(props.title).toBe('Provider 2')
  })

  it('when the step is providerName, the name is active and the rest pending', () => {
    const viewModel = new ProviderPromptViewModel()

    const props = viewModel.props({
      step: 'providerName',
      providers: [],
      providerName: insertText(emptyText(), 'd'),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
    })

    expect(props.fields).toEqual([
      {
        label: 'Name',
        input: { text: 'd', cursor: 1 },
        masked: false,
        status: 'active',
      },
      {
        label: 'Url',
        input: { text: '', cursor: 0 },
        masked: false,
        status: 'pending',
      },
      {
        label: 'API key',
        input: { text: '', cursor: 0 },
        masked: true,
        status: 'pending',
      },
    ])
  })

  it('when the step is providerUrl, the name is done, the url active and the key pending', () => {
    const viewModel = new ProviderPromptViewModel()

    const props = viewModel.props({
      step: 'providerUrl',
      providers: [],
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
    })

    expect(props.fields[0].status).toBe('done')
    expect(props.fields[1].status).toBe('active')
    expect(props.fields[2].status).toBe('pending')
  })
})
