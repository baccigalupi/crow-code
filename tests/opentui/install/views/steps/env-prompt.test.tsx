/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { EnvPrompt } from '../../../../../src/opentui/install/views/steps/env-prompt.tsx'
import { emptyText, insertText } from '../../../../../src/opentui/input-text.ts'

describe('EnvPrompt', () => {
  it('when a global directory is typed, defaults the env file inside it', async () => {
    const globalDirectory = insertText(emptyText(), '/opt/crow')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <EnvPrompt globalDirectory={globalDirectory} envFile={emptyText()} />,
      { width: 70, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Credentials .env file: (/opt/crow/.env)',
    )
    renderer.destroy()
  })
})
