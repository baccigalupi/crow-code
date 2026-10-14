import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import { EnvPrompt } from '../../../../../src/tui/install/views/steps/env-prompt.tsx'
import { emptyBuffer, insertText } from '../../../../../src/tui/input-buffer.ts'

describe('env-prompt', () => {
  it('when the step is not env, renders nothing', () => {
    const globalDirectory = emptyBuffer()
    const envFile = emptyBuffer()

    const { lastFrame } = render(
      <EnvPrompt
        step='user'
        globalDirectory={globalDirectory}
        envFile={envFile}
      />,
    )

    expect(lastFrame()).toBe('')
  })

  it('when the step is env, shows the derived fallback', () => {
    const globalDirectory = insertText(emptyBuffer(), '/opt/crow')
    const envFile = emptyBuffer()

    const { lastFrame } = render(
      <EnvPrompt
        step='env'
        globalDirectory={globalDirectory}
        envFile={envFile}
      />,
    )

    expect(lastFrame()).toContain('Credentials .env file: (/opt/crow/.env)')
  })
})
