import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { InstallScreen } from '../../../../src/tui/install/views/install-screen-view.ts'
import { emptyText } from '../../../../src/tui/input-text.ts'

describe('InstallScreen', () => {
  it('when mounted, shows the header with the step prompt on the last row', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 8 },
    )
    const screen = new InstallScreen(renderer)
    screen.mount()
    screen.stepPrompts.update({
      step: 'repo',
      props: {
        label: 'What directory for the local repo crow setup',
        input: emptyText(),
        defaultValue: '.crow',
        bare: false,
      },
    })

    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[7]).toContain('What directory for the local repo crow setup')
    expect(captureCharFrame()).toContain('Installing Crow Code')
    renderer.destroy()
  })

  it('when the terminal grows, the step prompt follows the last row', async () => {
    const { renderer, renderOnce, captureCharFrame, resize } =
      await createTestRenderer({ width: 70, height: 8 })
    const screen = new InstallScreen(renderer)
    screen.mount()
    screen.stepPrompts.update({
      step: 'repo',
      props: {
        label: 'What directory for the local repo crow setup',
        input: emptyText(),
        defaultValue: '.crow',
        bare: false,
      },
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
    const screen = new InstallScreen(renderer)
    screen.mount()
    screen.configPanel.update({
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
    screen.stepPrompts.update({
      step: 'providerName',
      props: {
        title: 'Provider 4',
        fields: [
          {
            label: 'Name',
            input: emptyText(),
            masked: false,
            status: 'active',
          },
          {
            label: 'Url',
            input: emptyText(),
            masked: false,
            status: 'pending',
          },
          {
            label: 'API key',
            input: emptyText(),
            masked: true,
            status: 'pending',
          },
        ],
      },
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
})
