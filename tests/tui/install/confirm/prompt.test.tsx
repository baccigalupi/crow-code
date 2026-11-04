import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { ConfirmPrompt } from '../../../../src/tui/install/confirm/prompt.tsx'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ConfirmPrompt', () => {
  it('when drawn, asks to complete setup with Yes selected', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <ConfirmPrompt model={model} />,
      { width: 40, height: 4 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Complete setup?')
    expect(captureCharFrame()).toContain('▶ Yes')
    act(() => renderer.destroy())
  })

  it('when the store says no, selects No', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <ConfirmPrompt model={model} />,
      { width: 40, height: 4 },
    )

    act(() => model.confirm.choose(false))
    await renderOnce()

    expect(captureCharFrame()).toContain('▶ No')
    act(() => renderer.destroy())
  })
})
