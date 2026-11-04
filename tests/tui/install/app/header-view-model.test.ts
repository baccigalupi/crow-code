import { describe, expect, it } from 'bun:test'
import { HeaderViewModel } from '../../../../src/tui/install/app/header-view-model.ts'

describe('HeaderViewModel', () => {
  it('when asked for colors, gives the chrome theme colors', () => {
    const viewModel = new HeaderViewModel()

    const colors = [viewModel.background, viewModel.textColor]

    expect(colors).toEqual(['#0b3d2e', '#e6ca6c'])
  })
})
