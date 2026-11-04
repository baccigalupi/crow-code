import { describe, expect, it } from 'bun:test'
import { ConfirmPromptViewModel } from '../../../../src/tui/install/confirm/prompt-view-model.ts'

describe('ConfirmPromptViewModel', () => {
  it('when the answer is yes, selects the first option', () => {
    const viewModel = new ConfirmPromptViewModel(true)

    const selectedIndex = viewModel.selectedIndex()

    expect(selectedIndex).toBe(0)
  })

  it('when the answer is no, selects the second option', () => {
    const viewModel = new ConfirmPromptViewModel(false)

    const selectedIndex = viewModel.selectedIndex()

    expect(selectedIndex).toBe(1)
  })
})
