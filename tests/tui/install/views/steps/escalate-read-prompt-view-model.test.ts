import { describe, expect, it } from 'bun:test'
import { escalateReadPromptViewModel } from '../../../../../src/tui/install/views/steps/escalate-read-prompt-view-model.ts'

describe('escalate-read-prompt-view-model', () => {
  it('when called, the default value lists the default escalate read directories', () => {
    const viewModel = escalateReadPromptViewModel

    const { defaultValue } = viewModel()

    expect(defaultValue).toBe('[]')
  })
})
