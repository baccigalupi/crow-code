import { describe, expect, it } from 'bun:test'
import { envPromptViewModel } from '../../../../../src/tui/install/views/steps/env-prompt-view-model.ts'
import { DataStore } from '../../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('env-prompt-view-model', () => {
  it('when the global directory is the default, the default value is ~/.crow/.env', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const { defaultValue } = envPromptViewModel(store.inputs.peek())

    expect(defaultValue).toBe('~/.crow/.env')
  })

  it('when the global directory is custom, the default value is .env inside it', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.directories.globalDirectory.insert('/opt/crow')

    const { defaultValue } = envPromptViewModel(store.inputs.peek())

    expect(defaultValue).toBe('/opt/crow/.env')
  })
})
