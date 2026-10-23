import { describe, expect, it } from 'bun:test'
import { confirmPromptViewModel } from '../../../../../src/tui/install/views/steps/confirm-prompt-view-model.ts'

describe('confirmPromptViewModel', () => {
  it('when confirmed, lists Yes and No and selects Yes', () => {
    const confirmation = true

    const viewModel = confirmPromptViewModel({ confirmation })

    expect(viewModel).toEqual({
      options: [
        { name: 'Yes', description: '' },
        { name: 'No', description: '' },
      ],
      selectedIndex: 0,
    })
  })

  it('when declined, selects No', () => {
    const confirmation = false

    const { selectedIndex } = confirmPromptViewModel({ confirmation })

    expect(selectedIndex).toBe(1)
  })
})
