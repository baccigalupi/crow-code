import { describe, expect, it } from 'bun:test'
import { ConfirmPromptViewModel } from '../../../../src/tui/install/view-models/confirm-prompt-view-model.ts'

describe('ConfirmPromptViewModel', () => {
  it('when confirmed, selects Yes', () => {
    const viewModel = new ConfirmPromptViewModel()

    const props = viewModel.props({ confirmation: true })

    expect(props).toEqual({ selectedIndex: 0 })
  })

  it('when declined, selects No', () => {
    const viewModel = new ConfirmPromptViewModel()

    const props = viewModel.props({ confirmation: false })

    expect(props).toEqual({ selectedIndex: 1 })
  })
})
