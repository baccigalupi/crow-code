import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import { ConfirmPrompt } from '../../../../../src/tui/install/views/steps/confirm-prompt.tsx'
import { emptyBuffer } from '../../../../../src/tui/input-buffer.ts'

describe('confirm-prompt', () => {
  it('when the step is not confirm, renders nothing', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = emptyBuffer()
    const envFile = emptyBuffer()

    const { lastFrame } = render(
      <ConfirmPrompt
        step='repo'
        repoDirectory={repoDirectory}
        globalDirectory={globalDirectory}
        envFile={envFile}
        confirmation
      />,
    )

    expect(lastFrame()).toBe('')
  })

  it('when confirming, asks whether to write the config path', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = emptyBuffer()
    const envFile = emptyBuffer()

    const { lastFrame } = render(
      <ConfirmPrompt
        step='confirm'
        repoDirectory={repoDirectory}
        globalDirectory={globalDirectory}
        envFile={envFile}
        confirmation
      />,
    )

    expect(lastFrame()).toContain('Write config to .crow/config.json?')
    expect(lastFrame()).toContain('Yes')
    expect(lastFrame()).toContain('No')
  })
})
