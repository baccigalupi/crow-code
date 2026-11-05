import { describe, expect, it } from 'bun:test'
import { RGBA } from '@opentui/core'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { Header } from '../../../../src/tui/install/layout/header.tsx'

describe('Header', () => {
  it('when drawn, shows the title and quit hint in chrome colors on the middle row', async () => {
    const { renderer, renderOnce, captureCharFrame, captureSpans } =
      await testRender(<Header />, { width: 40, height: 4 })

    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[1]).toContain('Installing Crow Code')
    expect(rows[1]).toContain('ctrl-c quit')
    expect(captureSpans().lines[1].spans[1].text).toBe('Installing Crow Code')
    expect(captureSpans().lines[1].spans[1].fg).toEqual(RGBA.fromHex('#e6ca6c'))
    expect(captureSpans().lines[1].spans[1].bg).toEqual(RGBA.fromHex('#0b3d2e'))
    act(() => renderer.destroy())
  })
})
