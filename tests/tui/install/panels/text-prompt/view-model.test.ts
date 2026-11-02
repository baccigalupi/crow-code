import { describe, expect, it } from 'bun:test'
import { TextPromptViewModel } from '../../../../../src/tui/install/panels/text-prompt/view-model.ts'
import { DataStore } from '../../../../../src/tui/install/data-store.ts'
import { RepoPanel } from '../../../../../src/tui/install/panels/repo.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('TextPromptViewModel', () => {
  it('when nothing is typed, shows the panel question, an empty answer and its default', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new TextPromptViewModel(new RepoPanel(), store)

    const props = viewModel.props(store.inputs.peek())

    expect(props).toEqual({
      label: 'What directory for the local repo crow setup',
      input: { text: '', cursor: 0 },
      defaultValue: '.crow',
      bare: false,
    })
  })

  it("when the panel's field has text, shows it as the answer", () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.directories.repoDirectory.insert('x')
    const viewModel = new TextPromptViewModel(new RepoPanel(), store)

    const props = viewModel.props(store.inputs.peek())

    expect(props.input).toEqual({ text: 'x', cursor: 1 })
  })
})
