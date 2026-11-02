import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { ConfigPreviewPanel } from '../../../../src/tui/install/panels/config-preview.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ConfigPreviewPanel', () => {
  it('when asked, names itself', () => {
    const panel = new ConfigPreviewPanel()

    const { name } = panel

    expect(name).toBe('configPreview')
  })

  it('when asked for its props, hides the preview on the first step', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const panel = new ConfigPreviewPanel()

    const props = panel.props(store, { key: 'repo' })

    expect(props.visible).toBe(false)
    expect(props.crowConfigPath).toBe('.crow/config.json')
  })

  it('when its view is mounted, shows the config path it is given', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 6 },
    )
    const view = new ConfigPreviewPanel().view(renderer)
    renderer.root.add(view.root())
    view.update({
      visible: true,
      crowConfigPath: '.crow/config.json',
      before: '{',
      highlighted: '"a": 1',
      after: '}',
    })

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Installing repo config in: .crow/config.json',
    )
    renderer.destroy()
  })
})
