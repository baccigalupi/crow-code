import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { ConfirmPanel } from '../../../../src/tui/install/confirm/confirm.tsx'
import { ConfirmPrompt } from '../../../../src/tui/install/confirm/prompt.tsx'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ConfirmPrompt', () => {
  it('when drawn, asks to complete setup with Yes selected', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <ConfirmPrompt panel={new ConfirmPanel()} store={store} />,
      { width: 40, height: 4 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Complete setup?')
    expect(captureCharFrame()).toContain('▶ Yes')
    act(() => renderer.destroy())
  })

  it('when the store says no, selects No', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <ConfirmPrompt panel={new ConfirmPanel()} store={store} />,
      { width: 40, height: 4 },
    )

    act(() => store.confirm.choose(false))
    await renderOnce()

    expect(captureCharFrame()).toContain('▶ No')
    act(() => renderer.destroy())
  })

  it('when n then return arrive, declines and exits', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, mockInput } = await testRender(
      <ConfirmPrompt panel={new ConfirmPanel()} store={store} />,
      { width: 40, height: 4 },
    )

    await act(() => mockInput.typeText('n'))
    act(() => mockInput.pressEnter())

    expect(store.confirm.confirmed.peek()).toBe(false)
    expect(store.quit.requested.peek()).toBe(true)
    act(() => renderer.destroy())
  })

  it('when left arrives on No, leans back to Yes', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.confirm.choose(false)
    const { renderer, mockInput } = await testRender(
      <ConfirmPrompt panel={new ConfirmPanel()} store={store} />,
      { width: 40, height: 4 },
    )

    act(() => mockInput.pressArrow('left'))

    expect(store.confirm.confirmed.peek()).toBe(true)
    act(() => renderer.destroy())
  })
})
