import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { CurrentPrompt } from '../../../../src/tui/install/components/current-prompt.tsx'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { Panels } from '../../../../src/tui/install/panels.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('CurrentPrompt', () => {
  it('when the navigator moves, swaps to the new panel prompt', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <CurrentPrompt model={model} panels={new Panels()} />,
      { width: 70, height: 3 },
    )

    act(() => model.navigator.goTo('crowGlobalDirectory'))
    await renderOnce()

    expect(captureCharFrame()).toContain('User crow directory: (~/.crow)')
    expect(captureCharFrame()).not.toContain('local repo')
    act(() => renderer.destroy())
  })
})
