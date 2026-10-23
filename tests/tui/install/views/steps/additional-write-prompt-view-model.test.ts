import { describe, expect, it } from 'bun:test'
import { additionalWritePromptViewModel } from '../../../../../src/tui/install/views/steps/additional-write-prompt-view-model.ts'

describe('additional-write-prompt-view-model', () => {
  it('when called, the default value lists the default additional write directories', () => {
    const viewModel = additionalWritePromptViewModel

    const { defaultValue } = viewModel()

    expect(defaultValue).toBe('[]')
  })
})
