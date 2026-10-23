/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { rgbToHex } from '@opentui/core'
import { testRender } from '@opentui/react/test-utils'
import { ConfigPanel } from '../../../../../src/opentui/install/views/steps/config-panel.tsx'
import { emptyText, insertText } from '../../../../../src/opentui/input-text.ts'

describe('ConfigPanel', () => {
  it('when the step is repo, renders nothing', async () => {
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <ConfigPanel
        globalDirectory={emptyText()}
        repoDirectory={emptyText()}
        envFile={emptyText()}
        additionalRead={emptyText()}
        escalateRead={emptyText()}
        escalateWrite={emptyText()}
        allowedLocalScripts={emptyText()}
        step="repo"
      />,
      { width: 70, height: 24 },
    )

    await renderOnce()

    expect(captureCharFrame().trim()).toBe('')
    renderer.destroy()
  })

  it('when past the repo step, shows the config path and json', async () => {
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <ConfigPanel
        globalDirectory={emptyText()}
        repoDirectory={emptyText()}
        envFile={emptyText()}
        additionalRead={emptyText()}
        escalateRead={emptyText()}
        escalateWrite={emptyText()}
        allowedLocalScripts={emptyText()}
        step="crowGlobalDirectory"
      />,
      { width: 70, height: 24 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Installing repo config in: .crow/config.json',
    )
    expect(captureCharFrame()).toContain('"crowGlobalDirectory": "~/.crow"')
    expect(captureCharFrame()).toContain('"envFile": "~/.crow/.env"')
    renderer.destroy()
  })

  it('when an env file is typed, shows it in the json', async () => {
    const envFile = insertText(emptyText(), '/secrets/crow.env')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <ConfigPanel
        globalDirectory={emptyText()}
        repoDirectory={emptyText()}
        envFile={envFile}
        additionalRead={emptyText()}
        escalateRead={emptyText()}
        escalateWrite={emptyText()}
        allowedLocalScripts={emptyText()}
        step="envFile"
      />,
      { width: 70, height: 24 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('"envFile": "/secrets/crow.env"')
    renderer.destroy()
  })

  it('when a line is highlighted, draws it dark on gold', async () => {
    const { renderer, renderOnce, captureSpans } = await testRender(
      <ConfigPanel
        globalDirectory={emptyText()}
        repoDirectory={emptyText()}
        envFile={emptyText()}
        additionalRead={emptyText()}
        escalateRead={emptyText()}
        escalateWrite={emptyText()}
        allowedLocalScripts={emptyText()}
        step="envFile"
      />,
      { width: 70, height: 24 },
    )

    await renderOnce()

    const highlighted = captureSpans().lines[5].spans[2]
    expect(highlighted.text).toBe('"envFile": "~/.crow/.env",')
    expect(rgbToHex(highlighted.fg)).toBe('#0a0f1e')
    expect(rgbToHex(highlighted.bg)).toBe('#e6ca6c')
    renderer.destroy()
  })
})
