import { describe, expect, it } from 'bun:test'
import { ignorePromptViewModel } from '../../../../../src/tui/install/views/steps/ignore-prompt-view-model.ts'

describe('ignore-prompt-view-model', () => {
  it('when called, the default value lists the default ignore paths', () => {
    const viewModel = ignorePromptViewModel

    const { defaultValue } = viewModel()

    expect(defaultValue).toBe('[]')
  })
})
