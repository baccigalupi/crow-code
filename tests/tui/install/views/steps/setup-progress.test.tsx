/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { SetupProgress } from '../../../../../src/tui/install/views/steps/setup-progress.tsx'

describe('SetupProgress', () => {
  it('when rendered, names the local config being written', async () => {
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <SetupProgress crowConfigPath=".crow/config.json" />,
      { width: 40, height: 2 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Writing config to .crow/config.json')
    renderer.destroy()
  })
})
