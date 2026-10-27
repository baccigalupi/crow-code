/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { EnvPrompt } from '../../../../../src/tui/install/views/steps/env-prompt.tsx'
import { DataStore } from '../../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('EnvPrompt', () => {
  it('when a global directory is typed, defaults the env file inside it', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.directories.globalDirectory.insert('/opt/crow')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <EnvPrompt {...store.inputs.peek()} />,
      { width: 70, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Credentials .env file: (/opt/crow/.env)',
    )
    renderer.destroy()
  })
})
