import { describe, expect, it } from 'bun:test'
import { ProviderPromptViewModel } from '../../../../src/tui/install/provider/provider-prompt-view-model.ts'

describe('ProviderPromptViewModel', () => {
  it('when one provider is saved, the title counts the next one', () => {
    const viewModel = new ProviderPromptViewModel([
      { name: 'nous', url: 'https://n' },
    ])

    const title = viewModel.title()

    expect(title).toBe('Provider 2')
  })
})
