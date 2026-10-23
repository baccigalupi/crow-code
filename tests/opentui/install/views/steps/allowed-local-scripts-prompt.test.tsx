/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { AllowedLocalScriptsPrompt } from '../../../../../src/opentui/install/views/steps/allowed-local-scripts-prompt.tsx'
import { emptyText, insertText } from '../../../../../src/opentui/input-text.ts'

describe('AllowedLocalScriptsPrompt', () => {
  it('when nothing is typed, shows the default scripts', async () => {
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <AllowedLocalScriptsPrompt allowedLocalScripts={emptyText()} />,
      { width: 70, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Allowed local scripts: (./dev/*, ./agent/*)',
    )
    renderer.destroy()
  })

  it('when scripts are typed, shows them instead of the default', async () => {
    const allowedLocalScripts = insertText(emptyText(), './a.sh, ./b.sh')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <AllowedLocalScriptsPrompt allowedLocalScripts={allowedLocalScripts} />,
      { width: 70, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Allowed local scripts: ./a.sh, ./b.sh',
    )
    expect(captureCharFrame()).not.toContain('./dev/*')
    renderer.destroy()
  })
})
