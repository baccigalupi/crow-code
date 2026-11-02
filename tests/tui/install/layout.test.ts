import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { Layout } from '../../../src/tui/install/layout.ts'
import { Panels } from '../../../src/tui/install/panels.ts'
import { emptyText } from '../../../src/tui/input-text.ts'

describe('Layout', () => {
  it('when mounted, shows the header with the prompt on the last row', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 8 },
    )
    const layout = new Layout(renderer, new Panels())
    layout.mount()
    layout.drawPrompt('repo', {
      label: 'What directory for the local repo crow setup',
      input: emptyText(),
      defaultValue: '.crow',
      bare: false,
    })

    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[7]).toContain(
      'What directory for the local repo crow setup: (.crow)',
    )
    expect(captureCharFrame()).toContain('Installing Crow Code')
    renderer.destroy()
  })

  it('when the terminal grows, the prompt follows the last row', async () => {
    const { renderer, renderOnce, captureCharFrame, resize } =
      await createTestRenderer({ width: 70, height: 8 })
    const layout = new Layout(renderer, new Panels())
    layout.mount()
    layout.drawPrompt('repo', {
      label: 'What directory for the local repo crow setup',
      input: emptyText(),
      defaultValue: '.crow',
      bare: false,
    })

    resize(70, 12)
    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[11]).toContain('What directory for the local repo crow setup')
    renderer.destroy()
  })

  it('when the config preview is taller than the screen, keeps the provider prompt visible', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 20 },
    )
    const layout = new Layout(renderer, new Panels())
    layout.mount()
    layout.drawPreview({
      visible: true,
      crowConfigPath: '.crow/config.json',
      before: `{
  "crowGlobalDirectory": "~/.crow",
  "envFile": "~/.crow/.env",
  "permissions": {
    "ignore": [],
    "additionalRead": [],
    "additionalWrite": [],
    "escalateRead": [],
    "escalateWrite": [],
    "allowedLocalScripts": []
  },
  "providers": [
    {
      "name": "one",
      "baseUrl": "https://one"
    },
    {
      "name": "two",
      "baseUrl": "https://two"
    },
    {
      "name": "three",
      "baseUrl": "https://three"
    },
    {
      `,
      highlighted: '"name": "",',
      after: `
      "baseUrl": ""
    }
  ]
}`,
    })
    layout.drawPrompt('providerName', {
      title: 'Provider 4',
      fields: [
        { label: 'Name', input: emptyText(), masked: false, status: 'active' },
        { label: 'Url', input: emptyText(), masked: false, status: 'pending' },
        {
          label: 'API key',
          input: emptyText(),
          masked: true,
          status: 'pending',
        },
      ],
    })

    await renderOnce()
    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[1]).toContain('Installing Crow Code')
    expect(rows[3]).toContain('Installing repo config in: .crow/config.json')
    expect(rows[8]).toContain('"name": ""')
    expect(rows[14]).toContain('Provider 4')
    expect(rows[19]).toContain('Esc to finish adding providers')
    renderer.destroy()
  })

  it("when the panel changes, shows the new panel's prompt", async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 6 },
    )
    const layout = new Layout(renderer, new Panels())
    layout.mount()
    layout.drawPrompt('repo', {
      label: 'What directory for the local repo crow setup',
      input: emptyText(),
      defaultValue: '.crow',
      bare: false,
    })
    layout.drawPrompt('crowGlobalDirectory', {
      label: 'User crow directory',
      input: emptyText(),
      defaultValue: '~/.crow',
      bare: false,
    })

    await renderOnce()

    expect(captureCharFrame()).toContain('User crow directory: (~/.crow)')
    expect(captureCharFrame()).not.toContain('local repo')
    renderer.destroy()
  })

  it('when the panel is confirm, renders the confirm prompt', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 6 },
    )
    const layout = new Layout(renderer, new Panels())
    layout.mount()
    layout.drawPrompt('confirm', { selectedIndex: 0 })

    await renderOnce()

    expect(captureCharFrame()).toContain('Complete setup?')
    renderer.destroy()
  })
})
