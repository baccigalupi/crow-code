import { describe, expect, it } from 'bun:test'
import { render } from 'ink-testing-library'
import { AllowedLocalScriptsPrompt } from '../../../../../src/tui/install/views/steps/allowed-local-scripts-prompt.tsx'
import { emptyBuffer, insertText } from '../../../../../src/tui/input-buffer.ts'

describe('allowed-local-scripts-prompt', () => {
  it('when nothing is typed, shows the default globs', () => {
    const allowedLocalScripts = emptyBuffer()

    const { lastFrame } = render(
      <AllowedLocalScriptsPrompt allowedLocalScripts={allowedLocalScripts} />,
    )

    expect(lastFrame()).toContain('Allowed local scripts: (./dev/*, ./agent/*)')
  })

  it('when scripts are typed, shows them instead of the default', () => {
    const allowedLocalScripts = insertText(emptyBuffer(), './a.sh, ./b.sh')

    const { lastFrame } = render(
      <AllowedLocalScriptsPrompt allowedLocalScripts={allowedLocalScripts} />,
    )

    expect(lastFrame()).toContain('Allowed local scripts: ./a.sh, ./b.sh')
    expect(lastFrame()).not.toContain('./dev/*')
  })
})
