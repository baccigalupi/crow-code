import { describe, expect, it } from 'bun:test'
import { rgbToHex } from '@opentui/core'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { ConfigPreview } from '../../../../src/tui/install/app/config-preview.tsx'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { Router } from '../../../../src/tui/install/router.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ConfigPreview', () => {
  it('when on the repo panel, renders nothing', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <ConfigPreview model={model} router={new Router()} />,
      { width: 70, height: 24 },
    )

    await renderOnce()

    expect(captureCharFrame().trim()).toBe('')
    act(() => renderer.destroy())
  })

  it('when past the repo panel, shows the config path and the json with the current line highlighted', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.navigator.goTo('envFile')
    const { renderer, renderOnce, captureCharFrame, captureSpans } =
      await testRender(<ConfigPreview model={model} router={new Router()} />, {
        width: 70,
        height: 24,
      })

    await renderOnce()

    const highlighted = captureSpans().lines[5].spans[2]
    expect(captureCharFrame()).toContain(
      'Installing repo config in: .crow/config.json',
    )
    expect(captureCharFrame()).toContain('"crowGlobalDirectory": "~/.crow"')
    expect(highlighted.text).toBe('"envFile": "~/.crow/.env",')
    expect(rgbToHex(highlighted.bg)).toBe('#e6ca6c')
    act(() => renderer.destroy())
  })
})
