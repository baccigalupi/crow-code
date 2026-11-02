import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { HeaderPanel } from '../../../../src/tui/install/panels/header.ts'

describe('HeaderPanel', () => {
  it('when asked, names itself', () => {
    const panel = new HeaderPanel()

    const { name } = panel

    expect(name).toBe('header')
  })

  it('when its view is mounted, shows the install title', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 3 },
    )
    renderer.root.add(new HeaderPanel().view(renderer).root())

    await renderOnce()

    expect(captureCharFrame()).toContain('Installing Crow Code')
    renderer.destroy()
  })
})
