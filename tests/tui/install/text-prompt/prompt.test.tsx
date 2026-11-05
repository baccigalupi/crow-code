import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { TextPrompt } from '../../../../src/tui/install/text-prompt/prompt.tsx'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('TextPrompt', () => {
  it('when the panel field changes, shows the typed answer', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <TextPrompt step="repoDirectory" store={store} />,
      { width: 70, height: 3 },
    )

    act(() => store.directories.repoDirectory.replace('x'))
    await renderOnce()

    expect(captureCharFrame()).toContain(
      'What directory for the local repo crow setup: x',
    )
    act(() => renderer.destroy())
  })

  it('when a key is typed, types it into the panel field', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, mockInput } = await testRender(
      <TextPrompt step="repoDirectory" store={store} />,
      { width: 70, height: 3 },
    )

    await act(() => mockInput.typeText('x'))

    expect(store.directories.repoDirectory.text.peek()).toBe('x')
    act(() => renderer.destroy())
  })

  it('when the field is empty, shows the default as the placeholder', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <TextPrompt step="repoDirectory" store={store} />,
      { width: 70, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'What directory for the local repo crow setup: (.crow)',
    )
    act(() => renderer.destroy())
  })

  it('when return arrives, moves to the panel that comes next', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, mockInput } = await testRender(
      <TextPrompt step="repoDirectory" store={store} />,
      { width: 70, height: 3 },
    )

    act(() => mockInput.pressEnter())

    expect(store.navigator.current.peek()).toBe('crowGlobalDirectory')
    act(() => renderer.destroy())
  })
})
