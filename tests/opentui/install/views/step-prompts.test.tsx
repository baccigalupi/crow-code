/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import { testRender } from '@opentui/react/test-utils'
import { StepPrompts } from '../../../../src/opentui/install/views/step-prompts.tsx'
import { emptyText } from '../../../../src/opentui/input-text.ts'
import type { InstallStep } from '../../../../src/opentui/install/types.ts'

describe('StepPrompts', () => {
  it('when the step is repo, renders the repo question on the bottom row', async () => {
    const installStore = {
      repoDirectory: signal(emptyText()),
      globalDirectory: signal(emptyText()),
      envFile: signal(emptyText()),
      escalateRead: signal(emptyText()),
      additionalRead: signal(emptyText()),
      escalateWrite: signal(emptyText()),
      allowedLocalScripts: signal(emptyText()),
      step: signal<InstallStep>('repo'),
      confirmation: signal(true),
    }
    const values = {
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      escalateRead: emptyText(),
      additionalRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
      crowConfigPath: '.crow/config.json',
      confirmation: true,
    }
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <StepPrompts installStore={installStore} values={values} />,
      { width: 70, height: 6 },
    )

    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[5]).toContain('What directory for the local repo crow setup')
    renderer.destroy()
  })
})
