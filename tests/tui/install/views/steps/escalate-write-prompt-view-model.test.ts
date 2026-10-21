import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { escalateWritePromptViewModel } from '../../../../../src/tui/install/views/steps/escalate-write-prompt-view-model.ts'

describe('escalate-write-prompt-view-model', () => {
  it('when called, the default value lists the default write directories', () => {
    const viewModel = escalateWritePromptViewModel

    const { defaultValue } = viewModel()

    expect(defaultValue).toBe('./dev, ./agent')
  })
})
