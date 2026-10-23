import { describe, expect, it } from 'bun:test'
import { allowedLocalScriptsPromptViewModel } from '../../../../../src/opentui/install/views/steps/allowed-local-scripts-prompt-view-model.ts'

describe('allowed-local-scripts-prompt-view-model', () => {
  it('when called, the default value lists the default script globs', () => {
    const viewModel = allowedLocalScriptsPromptViewModel

    const { defaultValue } = viewModel()

    expect(defaultValue).toBe('./dev/*, ./agent/*')
  })
})
