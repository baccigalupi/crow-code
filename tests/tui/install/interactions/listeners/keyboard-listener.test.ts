import { describe, expect, it, mock } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import type { KeyEvent } from '@opentui/core'
import { KeyboardListener } from '../../../../../src/tui/install/interactions/listeners/keyboard-listener.ts'
import { DataStore } from '../../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('KeyboardListener', () => {
  it('when ctrl-c arrives, destroys the renderer', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const onDestroy = mock(() => {})
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
      onDestroy,
    })
    new KeyboardListener(renderer, store).listen()

    mockInput.pressCtrlC()

    expect(onDestroy).toHaveBeenCalledTimes(1)
  })

  it('when the store asks to quit, destroys the renderer', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const onDestroy = mock(() => {})
    const { renderer } = await createTestRenderer({
      width: 20,
      height: 3,
      onDestroy,
    })
    new KeyboardListener(renderer, store).listen()

    store.quit.request()

    expect(onDestroy).toHaveBeenCalledTimes(1)
  })

  it('when another key arrives, leaves it for the focused component', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const onDestroy = mock(() => {})
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
      onDestroy,
    })
    new KeyboardListener(renderer, store).listen()
    const events: KeyEvent[] = []
    renderer.keyInput.on('keypress', (event) => events.push(event))

    await mockInput.typeText('c')

    expect(events[0].defaultPrevented).toBe(false)
    expect(onDestroy).not.toHaveBeenCalled()
    renderer.destroy()
  })
})
