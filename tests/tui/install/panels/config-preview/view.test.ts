import { describe, expect, it } from 'bun:test'
import { rgbToHex } from '@opentui/core'
import { createTestRenderer } from '@opentui/core/testing'
import { ConfigPanelView } from '../../../../../src/tui/install/panels/config-preview/view.ts'

describe('ConfigPanelView', () => {
  it('when not visible, renders nothing', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 24 },
    )
    const view = new ConfigPanelView(renderer)
    renderer.root.add(view.root())
    view.update({
      visible: false,
      crowConfigPath: '.crow/config.json',
      before: '{\n  "envFile": "~/.crow/.env"\n}',
      highlighted: '',
      after: '',
    })

    await renderOnce()

    expect(captureCharFrame().trim()).toBe('')
    renderer.destroy()
  })

  it('when visible, shows the config path and json', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 24 },
    )
    const view = new ConfigPanelView(renderer)
    renderer.root.add(view.root())
    view.update({
      visible: true,
      crowConfigPath: '.crow/config.json',
      before: '{\n  "crowGlobalDirectory": "~/.crow",\n  ',
      highlighted: '"envFile": "~/.crow/.env",',
      after: '\n  "providers": []\n}',
    })

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Installing repo config in: .crow/config.json',
    )
    expect(captureCharFrame()).toContain('"crowGlobalDirectory": "~/.crow"')
    expect(captureCharFrame()).toContain('"envFile": "~/.crow/.env"')
    renderer.destroy()
  })

  it('when a line is highlighted, draws it dark on gold', async () => {
    const { renderer, renderOnce, captureSpans } = await createTestRenderer({
      width: 70,
      height: 24,
    })
    const view = new ConfigPanelView(renderer)
    renderer.root.add(view.root())
    view.update({
      visible: true,
      crowConfigPath: '.crow/config.json',
      before: '{\n  "crowGlobalDirectory": "~/.crow",\n  ',
      highlighted: '"envFile": "~/.crow/.env",',
      after: '\n  "providers": []\n}',
    })

    await renderOnce()

    const highlighted = captureSpans().lines[5].spans[2]
    expect(highlighted.text).toBe('"envFile": "~/.crow/.env",')
    expect(rgbToHex(highlighted.fg)).toBe('#0a0f1e')
    expect(rgbToHex(highlighted.bg)).toBe('#e6ca6c')
    renderer.destroy()
  })
})
