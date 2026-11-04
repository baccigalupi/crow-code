import { describe, expect, it } from 'bun:test'
import { ConfigJsonViewModel } from '../../../../../src/tui/install/app/config-preview/config-json-view-model.ts'
import { DataStore } from '../../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('ConfigJsonViewModel', () => {
  it('when a key is highlighted, splits the config json around its line', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new ConfigJsonViewModel(store.inputs.peek(), {
      key: 'envFile',
    })

    const highlighted = viewModel.highlighted()

    expect(highlighted).toBe('"envFile": "~/.crow/.env",')
  })

  it('when a key is highlighted, puts the marker on its line below the padding', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new ConfigJsonViewModel(store.inputs.peek(), {
      key: 'envFile',
    })

    const row = viewModel.markerRow()

    expect(row).toBe(3)
  })

  it('when asked for colors, gives the config panel theme colors', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new ConfigJsonViewModel(store.inputs.peek(), {
      key: 'envFile',
    })

    const colors = [
      viewModel.background,
      viewModel.highlightTextColor,
      viewModel.highlightBackground,
    ]

    expect(colors).toEqual(['#0a0f1e', '#0a0f1e', '#e6ca6c'])
  })

  it('when asked for the line count, counts every json line', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new ConfigJsonViewModel(store.inputs.peek(), {
      key: 'envFile',
    })

    const lines = viewModel.lineCount()

    expect(lines).toBe(19)
  })
})
