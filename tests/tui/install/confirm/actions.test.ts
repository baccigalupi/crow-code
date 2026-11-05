import { describe, expect, it, mock } from 'bun:test'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { ConfirmActions } from '../../../../src/tui/install/confirm/actions.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ConfirmActions', () => {
  describe('change', () => {
    it('when No is highlighted, the answer is no', () => {
      const store = new DataStore({ applicationData: mockApplicationData() })
      const navigation = { goTo: mock(), exit: mock() }
      const actions = new ConfirmActions({
        store,
        navigation,
      })

      actions.change()(1)

      expect(store.confirm.confirmed.peek()).toBe(false)
    })

    it('when Yes is highlighted, the answer is yes', () => {
      const store = new DataStore({ applicationData: mockApplicationData() })
      store.confirm.choose(false)
      const navigation = { goTo: mock(), exit: mock() }
      const actions = new ConfirmActions({
        store,
        navigation,
      })

      actions.change()(0)

      expect(store.confirm.confirmed.peek()).toBe(true)
    })

    it('when highlighted, does not move', () => {
      const store = new DataStore({ applicationData: mockApplicationData() })
      const navigation = { goTo: mock(), exit: mock() }
      const actions = new ConfirmActions({
        store,
        navigation,
      })

      actions.change()(1)

      expect(navigation.goTo).toHaveBeenCalledTimes(0)
      expect(navigation.exit).toHaveBeenCalledTimes(0)
    })
  })

  it('when Yes is picked, goes to the next panel', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const navigation = { goTo: mock(), exit: mock() }
    const actions = new ConfirmActions({
      store,
      navigation,
    })

    actions.select()(0)

    expect(navigation.goTo.mock.calls).toEqual([['completeSetup']])
    expect(navigation.exit).toHaveBeenCalledTimes(0)
  })

  it('when No is picked, exits', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const navigation = { goTo: mock(), exit: mock() }
    const actions = new ConfirmActions({
      store,
      navigation,
    })

    actions.select()(1)

    expect(navigation.exit).toHaveBeenCalledTimes(1)
    expect(navigation.goTo).toHaveBeenCalledTimes(0)
  })
})
