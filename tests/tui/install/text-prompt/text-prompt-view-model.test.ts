import { describe, expect, it } from 'bun:test'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { TextPromptViewModel } from '../../../../src/tui/install/text-prompt/text-prompt-view-model.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('TextPromptViewModel', () => {
  it('when asked for its label, is the question the step asks', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new TextPromptViewModel('envFile', store)

    const label = viewModel.label()

    expect(label).toBe('Credentials .env file')
  })

  it('when asked for its placeholder, is the step placeholder', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new TextPromptViewModel('repoDirectory', store)

    const placeholder = viewModel.placeholder()

    expect(placeholder).toBe('(.crow)')
  })
})
