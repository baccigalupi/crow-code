import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import { DoneMessage } from '../../../../../src/tui/install/views/steps/done-message.tsx'
import { emptyBuffer } from '../../../../../src/tui/input-buffer.ts'

describe('done-message', () => {
  it('when the step is not done, renders nothing', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = emptyBuffer()
    const envFile = emptyBuffer()

    const { lastFrame } = render(
      <DoneMessage
        step='confirm'
        repoDirectory={repoDirectory}
        globalDirectory={globalDirectory}
        envFile={envFile}
      />,
    )

    expect(lastFrame()).toBe('')
  })

  it('when done, reports the written config path', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = emptyBuffer()
    const envFile = emptyBuffer()

    const { lastFrame } = render(
      <DoneMessage
        step='done'
        repoDirectory={repoDirectory}
        globalDirectory={globalDirectory}
        envFile={envFile}
      />,
    )

    expect(lastFrame()).toContain('Wrote config to .crow/config.json')
    expect(lastFrame()).toContain('press any key to exit')
  })
})
