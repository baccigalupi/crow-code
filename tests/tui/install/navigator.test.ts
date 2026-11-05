import { describe, expect, it, spyOn } from 'bun:test'
import { DataStore } from '../../../src/tui/install/data-store.ts'
import { Navigator } from '../../../src/tui/install/navigator.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('Navigator', () => {
  it('when built, current is the repo directory step', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const navigator = new Navigator(store)

    const result = navigator.current.peek()

    expect(result).toBe('repoDirectory')
  })

  it('when goTo is called, current is that step', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const navigator = new Navigator(store)

    navigator.goTo('ignore')

    expect(navigator.current.peek()).toBe('ignore')
  })

  it('when a step is entered, the step reacts to its arrival', () => {
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockImplementation(
      () => new Promise<void>(() => {}),
    )
    const store = new DataStore({ applicationData })
    const navigator = new Navigator(store)

    navigator.goTo('completeSetup')

    expect(store.progress.tasks.peek()).toHaveLength(2)
  })
})
