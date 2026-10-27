import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { ConfigJsonView } from '../../../../../src/tui/install/views/steps/config-json.ts'

describe('ConfigJsonView', () => {
  it('when the json fits, shows it from the top', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 30, height: 8 },
    )
    const view = new ConfigJsonView(renderer)
    renderer.root.add(view.root())
    view.update({ before: '{\n  ', highlighted: '"a": 1', after: '\n}' })

    await renderOnce()
    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[2]).toContain('{')
    expect(rows[3]).toContain('"a": 1')
    renderer.destroy()
  })

  it('when the json is taller than its rows, scrolls the highlighted line into view', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 30, height: 6 },
    )
    const view = new ConfigJsonView(renderer)
    renderer.root.add(view.root())
    view.update({
      before: '{\n  "a": 1,\n  "b": 2,\n  "c": 3,\n  "d": 4,\n  "e": 5,\n  ',
      highlighted: '"last": 6',
      after: '\n}',
    })

    await renderOnce()
    await renderOnce()

    expect(captureCharFrame()).toContain('"last": 6')
    renderer.destroy()
  })

  it('when scrolled away from the highlight, keeps the scroll across renders', async () => {
    const { renderer, renderOnce } = await createTestRenderer({
      width: 30,
      height: 6,
    })
    const view = new ConfigJsonView(renderer)
    renderer.root.add(view.root())
    view.update({
      before: '{\n  "a": 1,\n  "b": 2,\n  "c": 3,\n  "d": 4,\n  "e": 5,\n  ',
      highlighted: '"last": 6',
      after: '\n}',
    })
    await renderOnce()
    await renderOnce()

    view.root().scrollTop = 0
    await renderOnce()

    expect(view.root().scrollTop).toBe(0)
    renderer.destroy()
  })
})
