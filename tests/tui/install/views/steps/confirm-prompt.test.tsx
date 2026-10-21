import { describe, expect, it } from 'bun:test'
import { render } from 'ink-testing-library'
import { ConfirmPrompt } from '../../../../../src/tui/install/views/steps/confirm-prompt.tsx'

describe('confirm-prompt', () => {
  it('when rendered, asks whether to write the config path', () => {
    const prompt = (
      <ConfirmPrompt crowConfigPath=".crow/config.json" confirmation />
    )

    const { lastFrame } = render(prompt)

    expect(lastFrame()).toContain('Write config to .crow/config.json?')
    expect(lastFrame()).toContain('Yes')
    expect(lastFrame()).toContain('No')
  })
})
