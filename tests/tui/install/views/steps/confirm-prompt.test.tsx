import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import { ConfirmPrompt } from '../../../../../src/tui/install/views/steps/confirm-prompt.tsx'

describe('confirm-prompt', () => {
  it('when the step is not confirm, renders nothing', () => {
    const prompt = (
      <ConfirmPrompt
        step='repo'
        crowConfigPath='.crow/config.json'
        confirmation
      />
    )

    const { lastFrame } = render(prompt)

    expect(lastFrame()).toBe('')
  })

  it('when confirming, asks whether to write the config path', () => {
    const prompt = (
      <ConfirmPrompt
        step='confirm'
        crowConfigPath='.crow/config.json'
        confirmation
      />
    )

    const { lastFrame } = render(prompt)

    expect(lastFrame()).toContain('Write config to .crow/config.json?')
    expect(lastFrame()).toContain('Yes')
    expect(lastFrame()).toContain('No')
  })
})
