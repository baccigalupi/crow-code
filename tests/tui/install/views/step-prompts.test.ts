import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { StepPromptsView } from '../../../../src/tui/install/views/step-prompts.ts'
import { emptyText } from '../../../../src/tui/input-text.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('StepPromptsView', () => {
  it('when the step is repo, renders the repo question on the bottom row', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 6 },
    )
    const view = new StepPromptsView(renderer)
    renderer.root.add(view.root())
    view.update({
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
    expect(rows[5]).toContain('What directory for the local repo crow setup')
    renderer.destroy()
  })

  it("when the step changes, shows the new step's prompt", async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 6 },
    )
    const view = new StepPromptsView(renderer)
    renderer.root.add(view.root())
    view.update({
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
    view.update({
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
      step: 'crowGlobalDirectory',
      crowConfigPath: '.crow/config.json',
      confirmation: true,
    })

    await renderOnce()

    expect(captureCharFrame()).toContain('User crow directory: (~/.crow)')
    expect(captureCharFrame()).not.toContain('local repo')
    renderer.destroy()
  })

  it('when the step is unknown, renders nothing', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 6 },
    )
    const view = new StepPromptsView(renderer)
    renderer.root.add(view.root())
    view.update({
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
      step: 'default' as InstallStep,
      crowConfigPath: '.crow/config.json',
      confirmation: true,
    })

    await renderOnce()

    expect(captureCharFrame().trim()).toBe('')
    renderer.destroy()
  })
})
