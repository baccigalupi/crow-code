import { describe, expect, it } from 'bun:test'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { ConfirmStep } from '../../../../src/tui/install/steps/confirm-step.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('Step', () => {
  it('when entered and not overridden, leaves the store alone', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const step = new ConfirmStep()

    step.entered(store)

    expect(store.progress.tasks.peek()).toEqual([])
    expect(store.navigator.current.peek()).toBe('repoDirectory')
  })
})
