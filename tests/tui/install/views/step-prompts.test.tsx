/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { StepPrompts } from '../../../../src/tui/install/views/step-prompts.tsx'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { emptyText } from '../../../../src/tui/input-text.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('StepPrompts', () => {
  it('when the step is repo, renders the repo question on the bottom row', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const values = {
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
      step: 'repo' as const,
      crowConfigPath: '.crow/config.json',
      confirmation: true,
    }
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <StepPrompts model={model} values={values} />,
      { width: 70, height: 6 },
    )

    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[5]).toContain('What directory for the local repo crow setup')
    renderer.destroy()
  })
})
