import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import { ConfigPanel } from '../../../../../src/tui/install/views/steps/config-panel.tsx'
import { emptyBuffer, insertText } from '../../../../../src/tui/input-buffer.ts'

describe('config panel', () => {
  it('when the step is repo, renders nothing', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = emptyBuffer()
    const envFile = emptyBuffer()

    const { lastFrame } = render(
      <ConfigPanel
        step='repo'
        repoDirectory={repoDirectory}
        globalDirectory={globalDirectory}
        envFile={envFile}
        escalateRead={emptyBuffer()}
        additionalRead={emptyBuffer()}
        escalateWrite={emptyBuffer()}
        allowedLocalScripts={emptyBuffer()}
      />,
    )

    expect(lastFrame()).toBe('')
  })

  it('when the step is past repo, shows the config', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = emptyBuffer()
    const envFile = emptyBuffer()

    const { lastFrame } = render(
      <ConfigPanel
        step='crowGlobalDirectory'
        repoDirectory={repoDirectory}
        globalDirectory={globalDirectory}
        envFile={envFile}
        escalateRead={emptyBuffer()}
        additionalRead={emptyBuffer()}
        escalateWrite={emptyBuffer()}
        allowedLocalScripts={emptyBuffer()}
      />,
    )

    expect(lastFrame()).toContain(
      'Installing repo config in: .crow/config.json',
    )
    expect(lastFrame()).toContain('"crowGlobalDirectory": "~/.crow"')
    expect(lastFrame()).toContain('"envFile": "~/.crow/.env"')
  })

  it('when an env file is typed, shows it in the config', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = emptyBuffer()
    const envFile = insertText(emptyBuffer(), '/secrets/crow.env')

    const { lastFrame } = render(
      <ConfigPanel
        step='envFile'
        repoDirectory={repoDirectory}
        globalDirectory={globalDirectory}
        envFile={envFile}
        escalateRead={emptyBuffer()}
        additionalRead={emptyBuffer()}
        escalateWrite={emptyBuffer()}
        allowedLocalScripts={emptyBuffer()}
      />,
    )

    expect(lastFrame()).toContain('"envFile": "/secrets/crow.env"')
  })
})
