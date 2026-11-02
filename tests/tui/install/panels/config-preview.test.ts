import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { ConfigPreviewPanel } from '../../../../src/tui/install/panels/config-preview.ts'

describe('ConfigPreviewPanel', () => {
  it('when asked, names itself', () => {
    const panel = new ConfigPreviewPanel()

    const { name } = panel

    expect(name).toBe('configPreview')
  })

  it('when asked for its view model, hides the preview on the first step', () => {
    const panel = new ConfigPreviewPanel()

    const props = panel.viewModel().props(
      {
        repoDirectory: { text: '', cursor: 0 },
        globalDirectory: { text: '', cursor: 0 },
        envFile: { text: '', cursor: 0 },
        ignore: { text: '', cursor: 0 },
        additionalRead: { text: '', cursor: 0 },
        additionalWrite: { text: '', cursor: 0 },
        escalateRead: { text: '', cursor: 0 },
        escalateWrite: { text: '', cursor: 0 },
        allowedLocalScripts: { text: '', cursor: 0 },
        providerName: { text: '', cursor: 0 },
        providerUrl: { text: '', cursor: 0 },
        providerCredentials: { text: '', cursor: 0 },
        providers: [],
        step: 'repo',
      },
      { key: 'repo' },
    )

    expect(props.visible).toBe(false)
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
