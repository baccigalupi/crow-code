/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { TextAttributes } from '@opentui/core'
import { testRender } from '@opentui/react/test-utils'
import { DoneMessage } from '../../../../../src/tui/install/views/steps/done-message.tsx'

describe('DoneMessage', () => {
  it('when rendered, names the written config and dims the exit hint', async () => {
    const { renderer, renderOnce, captureCharFrame, captureSpans } =
      await testRender(<DoneMessage crowConfigPath=".crow/config.json" />, {
        width: 40,
        height: 2,
      })

    await renderOnce()

    expect(captureCharFrame()).toContain('Wrote config to .crow/config.json')
    expect(captureCharFrame()).toContain('press any key to exit')
    const { spans } = captureSpans().lines[1]
    expect(spans[1].text).toBe('press any key to exit')
    expect(spans[1].attributes).toBe(TextAttributes.DIM)
    renderer.destroy()
  })
})
