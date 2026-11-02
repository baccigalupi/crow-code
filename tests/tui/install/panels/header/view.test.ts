import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { HeaderView } from '../../../../../src/tui/install/panels/header/view.ts'

describe('HeaderView', () => {
  it('when rendered, shows the title and quit hint on the middle row between blank rows', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 40, height: 3 },
    )
    renderer.root.add(new HeaderView(renderer).root())

    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[0].trim()).toBe('')
    expect(rows[1]).toContain('Installing Crow Code')
    expect(rows[1]).toContain('ctrl-c quit')
    expect(rows[2].trim()).toBe('')
    renderer.destroy()
  })
})
