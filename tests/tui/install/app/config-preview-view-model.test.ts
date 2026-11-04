import { describe, expect, it } from 'bun:test'
import { ConfigPreviewViewModel } from '../../../../src/tui/install/app/config-preview-view-model.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ConfigPreviewViewModel', () => {
  it('when asked for the path line, names where the repo config goes', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new ConfigPreviewViewModel(store.inputs.peek())

    const line = viewModel.pathLine()

    expect(line).toBe('Installing repo config in: .crow/config.json')
  })
})
