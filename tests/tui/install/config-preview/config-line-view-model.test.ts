import { describe, expect, it } from 'bun:test'
import { ConfigLineViewModel } from '../../../../src/tui/install/config-preview/config-line-view-model.ts'

describe('ConfigLineViewModel', () => {
  it('when the selected step is its step, is highlighted', () => {
    const viewModel = new ConfigLineViewModel({
      step: 'envFile',
      editable: true,
      selectedStep: 'envFile',
    })

    const highlighted = viewModel.highlighted()

    expect(highlighted).toBe(true)
  })

  it('when the selected step is its step but it is not editable, is not highlighted', () => {
    const viewModel = new ConfigLineViewModel({
      step: 'envFile',
      editable: false,
      selectedStep: 'envFile',
    })

    const highlighted = viewModel.highlighted()

    expect(highlighted).toBe(false)
  })

  it('when asked for its highlight colors, gives dark on gold', () => {
    const viewModel = new ConfigLineViewModel({
      step: 'envFile',
      editable: true,
      selectedStep: 'envFile',
    })

    const colors = [viewModel.textColor, viewModel.background]

    expect(colors).toEqual(['#0a0f1e', '#e6ca6c'])
  })

  it('when another step is selected, is not highlighted', () => {
    const viewModel = new ConfigLineViewModel({
      step: 'envFile',
      editable: true,
      selectedStep: 'ignore',
    })

    const highlighted = viewModel.highlighted()

    expect(highlighted).toBe(false)
  })
})
