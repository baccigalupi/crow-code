import { describe, expect, it } from 'bun:test'
import { additionalReadPromptViewModel } from '../../../../../src/tui/install/views/steps/additional-read-prompt-view-model.ts'

describe('additional-read-prompt-view-model', () => {
  it('when called, the default value lists the default additional read directories', () => {
    const viewModel = additionalReadPromptViewModel

    const { defaultValue } = viewModel()

    expect(defaultValue).toBe('[]')
  })
})
