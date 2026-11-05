import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { DonePanel } from '../../../../src/tui/install/done/done.tsx'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('DonePanel', () => {
  it('when asked, names itself', () => {
    const panel = new DonePanel()

    const { name } = panel

    expect(name).toBe('done')
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
