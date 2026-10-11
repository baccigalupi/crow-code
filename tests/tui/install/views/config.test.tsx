import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import { ConfigPanel } from '../../../../src/tui/install/views/config.tsx'
import { emptyBuffer } from '../../../../src/tui/input-buffer.ts'

describe('config panel', () => {
  it('when the step is repo, renders nothing', () => {
    const repo = emptyBuffer()
    const user = emptyBuffer()

    const { lastFrame } = render(
      <ConfigPanel step='repo' repo={repo} user={user} />,
    )

    expect(lastFrame()).toBe('')
  })

  it('when the step is past repo, shows the config', () => {
    const repo = emptyBuffer()
    const user = emptyBuffer()

    const { lastFrame } = render(
      <ConfigPanel step='user' repo={repo} user={user} />,
    )

    expect(lastFrame()).toContain(
      'Installing repo config in: .crow/config.json',
    )
    expect(lastFrame()).toContain('"userDirectory": "~/.crow"')
  })
})
