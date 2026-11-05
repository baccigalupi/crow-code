import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { CurrentPrompt } from '../../../../src/tui/install/app/current-prompt.tsx'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('CurrentPrompt', () => {
  it('when the navigator moves, swaps to the new step prompt', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <CurrentPrompt store={store} />,
      { width: 70, height: 3 },
    )

    act(() => store.navigator.goTo('crowGlobalDirectory'))
    await renderOnce()

    expect(captureCharFrame()).toContain('User crow directory: (~/.crow)')
    expect(captureCharFrame()).not.toContain('local repo')
    act(() => renderer.destroy())
  })

  it('when on confirm, shows the confirm question', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.navigator.goTo('confirm')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <CurrentPrompt store={store} />,
      { width: 70, height: 4 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Complete setup?')
    act(() => renderer.destroy())
  })
})
