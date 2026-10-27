import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { InstallScreen } from '../../../../src/tui/install/views/install-screen.ts'
import { emptyText } from '../../../../src/tui/input-text.ts'

describe('InstallScreen', () => {
  it('when mounted, shows the header with the step prompt on the last row', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 8 },
    )
    const screen = new InstallScreen(renderer)
    screen.mount()
    screen.stepPrompts.update({
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      escalateRead: emptyText(),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [],
      setupTasks: [],
      step: 'repo',
      crowConfigPath: '.crow/config.json',
      confirmation: true,
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
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      escalateRead: emptyText(),
      ignore: emptyText(),
      additionalRead: emptyText(),
      additionalWrite: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      providerName: emptyText(),
      providerUrl: emptyText(),
      providerCredentials: emptyText(),
      providers: [],
      setupTasks: [],
      step: 'repo',
      crowConfigPath: '.crow/config.json',
      confirmation: true,
    })

    resize(70, 12)
    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[11]).toContain('What directory for the local repo crow setup')
    renderer.destroy()
  })
})
