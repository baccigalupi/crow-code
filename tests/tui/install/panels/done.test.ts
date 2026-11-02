import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { DonePanel } from '../../../../src/tui/install/panels/done.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('DonePanel', () => {
  it('when asked, names itself and has nowhere to go next', () => {
    const panel = new DonePanel()

    const { name } = panel

    expect(name).toBe('done')
    expect(panel.next).toBeUndefined()
    expect(panel.cancel).toBeUndefined()
  })

  it('when any key is pressed, its controller exits', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new DonePanel().controller(store)

    const outcome = controller.handle(new Keypress('x', {}))

    expect(outcome).toBe('exit')
  })

  it('when no setup task has failed, its view model says it is done', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const props = new DonePanel().props(store)

    expect(props.hint).toBe('Done! Press any key to exit')
  })
})
