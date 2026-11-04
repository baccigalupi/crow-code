import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { DonePanel } from '../../../../src/tui/install/panels/done.tsx'
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

  it('when asked for its prompt, says it is done', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      new DonePanel().prompt(store),
      { width: 50, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Done! Press any key to exit')
    act(() => renderer.destroy())
  })
})
