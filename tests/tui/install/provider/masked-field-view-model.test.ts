import { describe, expect, it } from 'bun:test'
import { maskedFieldViewModel } from '../../../../src/tui/install/provider/masked-field-view-model.ts'

describe('maskedFieldViewModel', () => {
  it('when text is typed, shows one dot per character', () => {
    const viewModel = maskedFieldViewModel('sk-12')

    const dots = viewModel.dots()

    expect(dots).toBe('•••••')
  })
})
