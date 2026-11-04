import { describe, expect, it } from 'bun:test'
import { TextAttributes } from '@opentui/core'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { DoneMessage } from '../../../../src/tui/install/components/done-message.tsx'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('DoneMessage', () => {
  it('when every task finished, shows the rows and a dim done hint', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.progress.list([
      {
        id: 'LocalConfigTask',
        label: 'Writing config to .crow/config.json',
        done: true,
        error: '',
      },
    ])
    const { renderer, renderOnce, captureCharFrame, captureSpans } =
      await testRender(<DoneMessage model={model} />, {
        width: 50,
        height: 3,
      })

    await renderOnce()

    expect(captureCharFrame()).toContain(
      '✓ Writing config to .crow/config.json',
    )
    expect(captureCharFrame()).toContain('Done! Press any key to exit')
    expect(captureSpans().lines[1].spans[1].attributes).toBe(TextAttributes.DIM)
    act(() => renderer.destroy())
  })

  it('when a task failed, says setup failed', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.progress.list([
      {
        id: 'LocalConfigTask',
        label: 'Writing config to .crow/config.json',
        done: true,
        error: 'EACCES',
      },
    ])
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <DoneMessage model={model} />,
      { width: 50, height: 4 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Setup failed. Press any key to exit')
    act(() => renderer.destroy())
  })
})
