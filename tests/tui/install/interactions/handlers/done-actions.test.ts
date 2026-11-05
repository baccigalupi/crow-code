import { describe, expect, it } from 'bun:test'
import { DataStore } from '../../../../../src/tui/install/data-store.ts'
import { DoneActions } from '../../../../../src/tui/install/interactions/handlers/done-actions.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('DoneActions', () => {
  it('when a key arrives, asks to quit', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    new DoneActions(store).keyDown()()

    expect(store.quit.requested.peek()).toBe(true)
  })
})
