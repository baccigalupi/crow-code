import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { ConfirmPanel } from '../../../../src/tui/install/confirm/confirm.tsx'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ConfirmPanel', () => {
  it('when asked, names itself and the panel that comes next', () => {
    const panel = new ConfirmPanel()

    const { name } = panel

    expect(name).toBe('confirm')
    expect(panel.next).toBe('completeSetup')
  })

  it('when asked for its prompt, asks to complete setup', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      new ConfirmPanel().prompt(store),
      { width: 40, height: 4 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Complete setup?')
    act(() => renderer.destroy())
  })
})
