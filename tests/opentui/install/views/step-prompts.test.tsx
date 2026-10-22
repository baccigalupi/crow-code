/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import { testRender } from '@opentui/react/test-utils'
import { StepPrompts } from '../../../../src/opentui/install/views/step-prompts.tsx'
import { emptyBuffer } from '../../../../src/tui/input-buffer.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('StepPrompts', () => {
  it('when the step has a view, renders it on the bottom row', async () => {
    const installStore = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('repo'),
      confirmation: signal(true),
    }
    const values = {
      repoDirectory: emptyBuffer(),
      globalDirectory: emptyBuffer(),
      envFile: emptyBuffer(),
      escalateRead: emptyBuffer(),
      additionalRead: emptyBuffer(),
      escalateWrite: emptyBuffer(),
      allowedLocalScripts: emptyBuffer(),
      crowConfigPath: '.crow/config.json',
      confirmation: true,
    }
    const Question = () => <text>Q?</text>
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <StepPrompts
        installStore={installStore}
        values={values}
        views={{ repo: Question }}
      />,
      { width: 20, height: 6 },
    )

    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[5]).toContain('Q?')
    renderer.destroy()
  })
})
