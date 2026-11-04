import { describe, expect, it } from 'bun:test'
import { PromptLineViewModel } from '../../../../src/tui/install/text-prompt/prompt-line-view-model.ts'

describe('PromptLineViewModel', () => {
  it('when the cursor is inside the text, splits the text around it', () => {
    const viewModel = new PromptLineViewModel({ text: 'abc', cursor: 1 }, false)

    const parts = [
      viewModel.beforeCursor(),
      viewModel.atCursor(),
      viewModel.afterCursor(),
    ]

    expect(parts).toEqual(['a', 'b', 'c'])
  })

  it('when the cursor is at the end, the cursor is a blank', () => {
    const viewModel = new PromptLineViewModel({ text: 'ab', cursor: 2 }, false)

    const parts = [
      viewModel.beforeCursor(),
      viewModel.atCursor(),
      viewModel.afterCursor(),
    ]

    expect(parts).toEqual(['ab', ' ', ''])
  })

  it('when masked, shows bullets for the typed characters', () => {
    const viewModel = new PromptLineViewModel({ text: 'sk-1', cursor: 4 }, true)

    const before = viewModel.beforeCursor()

    expect(before).toBe('••••')
  })
})
