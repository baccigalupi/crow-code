import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { StepPromptsView } from '../../../../src/tui/install/views/step-prompts-view.ts'
import { emptyText } from '../../../../src/tui/input-text.ts'

describe('StepPromptsView', () => {
  it('when the step is repo, renders the repo question on the bottom row', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 6 },
    )
    const view = new StepPromptsView(renderer)
    renderer.root.add(view.root())
    view.update({
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
    expect(rows[5]).toContain(
      'What directory for the local repo crow setup: (.crow)',
    )
    renderer.destroy()
  })

  it("when the step changes, shows the new step's prompt", async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 6 },
    )
    const view = new StepPromptsView(renderer)
    renderer.root.add(view.root())
    view.update({
      step: 'repo',
      props: {
        label: 'What directory for the local repo crow setup',
        input: emptyText(),
        defaultValue: '.crow',
        bare: false,
      },
    })
    view.update({
      step: 'crowGlobalDirectory',
      props: {
        label: 'User crow directory',
        input: emptyText(),
        defaultValue: '~/.crow',
        bare: false,
      },
    })

    await renderOnce()

    expect(captureCharFrame()).toContain('User crow directory: (~/.crow)')
    expect(captureCharFrame()).not.toContain('local repo')
    renderer.destroy()
  })

  it('when the step is confirm, renders the confirm prompt', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 6 },
    )
    const view = new StepPromptsView(renderer)
    renderer.root.add(view.root())
    view.update({ step: 'confirm', props: { selectedIndex: 0 } })

    await renderOnce()

    expect(captureCharFrame()).toContain('Complete setup?')
    renderer.destroy()
  })

  it('when the step is unknown, renders nothing', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 6 },
    )
    const view = new StepPromptsView(renderer)
    renderer.root.add(view.root())
    view.update({ step: 'default' as 'repo', props: {} })

    await renderOnce()

    expect(captureCharFrame().trim()).toBe('')
    renderer.destroy()
  })
})
