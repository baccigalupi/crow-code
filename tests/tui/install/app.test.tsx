import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { InstallApp } from '../../../src/tui/install/app.tsx'
import { DataStore } from '../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('InstallApp', () => {
  it('when drawn in a short terminal, shows the header and the question on the last row', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <InstallApp store={store} />,
      { width: 70, height: 8 },
    )

    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[1]).toContain('Installing Crow Code')
    expect(rows[7]).toContain('What directory for the local repo crow setup')
    act(() => renderer.destroy())
  })

  it('when drawn in a tall terminal, keeps the question on the last row', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.navigator.goTo('crowGlobalDirectory')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <InstallApp store={store} />,
      { width: 70, height: 24 },
    )

    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[23]).toContain('User crow directory: (~/.crow)')
    act(() => renderer.destroy())
  })

  it('when the terminal is resized, the question follows the last row', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame, resize } = await testRender(
      <InstallApp store={store} />,
      {
        width: 70,
        height: 8,
      },
    )
    await renderOnce()

    act(() => resize(70, 12))
    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[11]).toContain('What directory for the local repo crow setup')
    act(() => renderer.destroy())
  })

  it('when the config preview is tall, keeps the provider prompt visible', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.providers.save({ name: 'a', url: 'https://a' }, '')
    store.providers.save({ name: 'b', url: 'https://b' }, '')
    store.providers.save({ name: 'c', url: 'https://c' }, '')
    store.navigator.goTo('providerName')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <InstallApp store={store} />,
      { width: 70, height: 20 },
    )

    await renderOnce()
    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[1]).toContain('Installing Crow Code')
    expect(rows[3]).toContain('Installing repo config in: .crow/config.json')
    expect(rows[14]).toContain('Provider 4')
    expect(rows[19]).toContain('Esc to finish adding providers')
    act(() => renderer.destroy())
  })
})
