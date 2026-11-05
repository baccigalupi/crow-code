import { describe, expect, it } from 'bun:test'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { AdditionalWritePanel } from '../../../../src/tui/install/permissions/additional-write.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('AdditionalWritePanel', () => {
  it('when asked, names itself and the panel that comes next', () => {
    const panel = new AdditionalWritePanel()

    const { name } = panel

    expect(name).toBe('additionalWrite')
    expect(panel.next).toBe('escalateRead')
  })

  it('when asked for its field, is the additional write list', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const field = new AdditionalWritePanel().field(store)

    expect(field).toBe(store.permissions.additionalWrite)
  })

  it('when nothing is typed, it shows the question and a bare default', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const panel = new AdditionalWritePanel()

    const defaultValue = panel.defaultValue(store)

    expect(panel.label).toBe('Additional write directories')
    expect(defaultValue).toBe(store.permissions.defaultAdditionalWrite)
    expect(panel.bare).toBe(true)
  })
})
