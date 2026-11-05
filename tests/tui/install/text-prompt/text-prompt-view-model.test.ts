import { describe, expect, it } from 'bun:test'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { TextPromptViewModel } from '../../../../src/tui/install/text-prompt/text-prompt-view-model.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('TextPromptViewModel', () => {
  it('when asked for its label, is the question the step asks', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new TextPromptViewModel(
      'envFile',
      store.textDefaults.peek(),
    )

    const label = viewModel.label()

    expect(label).toBe('Credentials .env file')
  })

  it('when asked for its placeholder, is the default in parentheses', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new TextPromptViewModel(
      'repoDirectory',
      store.textDefaults.peek(),
    )

    const placeholder = viewModel.placeholder()

    expect(placeholder).toBe('(.crow)')
  })

  it('when the step is bare, its placeholder is the default alone', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new TextPromptViewModel(
      'ignore',
      store.textDefaults.peek(),
    )

    const placeholder = viewModel.placeholder()

    expect(placeholder).toBe('[]')
  })
})
