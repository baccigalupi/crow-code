/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { Header } from '../../../../src/tui/install/views/header.tsx'

describe('Header', () => {
  it('when rendered, shows the title and quit hint on the middle row between blank rows', async () => {
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <Header />,
      { width: 40, height: 3 },
    )

    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[0].trim()).toBe('')
    expect(rows[1]).toContain('Installing Crow Code')
    expect(rows[1]).toContain('ctrl-c quit')
    expect(rows[2].trim()).toBe('')
    renderer.destroy()
  })
})
