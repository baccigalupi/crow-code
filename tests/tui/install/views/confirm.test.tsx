import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import {
  ConfirmPrompt,
  DoneMessage,
} from '../../../../src/tui/install/views/confirm.tsx'
import { emptyBuffer } from '../../../../src/tui/input-buffer.ts'

describe('confirm views', () => {
  it('when the step is not confirm, the prompt renders nothing', () => {
    const repo = emptyBuffer()
    const user = emptyBuffer()

    const { lastFrame } = render(
      <ConfirmPrompt step='repo' repo={repo} user={user} confirmation />,
    )

    expect(lastFrame()).toBe('')
  })

  it('when confirming, asks whether to write the config path', () => {
    const repo = emptyBuffer()
    const user = emptyBuffer()

    const { lastFrame } = render(
      <ConfirmPrompt step='confirm' repo={repo} user={user} confirmation />,
    )

    expect(lastFrame()).toContain('Write config to .crow/config.json?')
    expect(lastFrame()).toContain('Yes')
    expect(lastFrame()).toContain('No')
  })

  it('when the step is not done, the message renders nothing', () => {
    const repo = emptyBuffer()
    const user = emptyBuffer()

    const { lastFrame } = render(
      <DoneMessage step='confirm' repo={repo} user={user} />,
    )

    expect(lastFrame()).toBe('')
  })

  it('when done, reports the written config path', () => {
    const repo = emptyBuffer()
    const user = emptyBuffer()

    const { lastFrame } = render(
      <DoneMessage step='done' repo={repo} user={user} />,
    )

    expect(lastFrame()).toContain('Wrote config to .crow/config.json')
    expect(lastFrame()).toContain('press any key to exit')
  })
})
