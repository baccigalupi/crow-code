import { describe, expect, it } from 'bun:test'
import { TextAttributes } from '@opentui/core'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import {
  PromptLine,
  TextPrompt,
} from '../../../../src/tui/install/text-prompt/prompt.tsx'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { emptyText, insertText } from '../../../../src/tui/input-text.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('text-prompt', () => {
  describe('PromptLine', () => {
    it('when the input is empty, shows the label and the dimmed placeholder', async () => {
      const { renderer, renderOnce, captureCharFrame, captureSpans } =
        await testRender(
          <PromptLine
            label="Where"
            input={emptyText()}
            placeholder="(.crow)"
            masked={false}
          />,
          { width: 40, height: 3 },
        )

      await renderOnce()

      expect(captureCharFrame()).toContain('Where: (.crow)')
      expect(captureSpans().lines[0].spans[1].text).toBe('(.crow)')
      expect(captureSpans().lines[0].spans[1].attributes).toBe(
        TextAttributes.DIM,
      )
      act(() => renderer.destroy())
    })

    it('when the input has text, shows the text', async () => {
      const { renderer, renderOnce, captureCharFrame } = await testRender(
        <PromptLine
          label="Where"
          input={insertText(emptyText(), './lib')}
          placeholder=""
          masked={false}
        />,
        { width: 40, height: 3 },
      )

      await renderOnce()

      expect(captureCharFrame()).toContain('Where: ./lib')
      act(() => renderer.destroy())
    })

    it('when the cursor is inside the text, the character under it is inverse', async () => {
      const { renderer, renderOnce, captureSpans } = await testRender(
        <PromptLine
          label="Where"
          input={{ text: 'abc', cursor: 1 }}
          placeholder=""
          masked={false}
        />,
        { width: 20, height: 1 },
      )

      await renderOnce()

      const { spans } = captureSpans().lines[0]
      expect(spans[1].text).toBe('b')
      expect(spans[1].attributes).toBe(TextAttributes.INVERSE)
      act(() => renderer.destroy())
    })

    it('when the cursor is at the end, shows an inverse blank after the text', async () => {
      const { renderer, renderOnce, captureSpans } = await testRender(
        <PromptLine
          label="Where"
          input={{ text: 'ab', cursor: 2 }}
          placeholder=""
          masked={false}
        />,
        { width: 20, height: 1 },
      )

      await renderOnce()

      const { spans } = captureSpans().lines[0]
      expect(spans[0].text).toBe(' Where: ab')
      expect(spans[1].text).toBe(' ')
      expect(spans[1].attributes).toBe(TextAttributes.INVERSE)
      act(() => renderer.destroy())
    })

    it('when masked, hides the typed characters', async () => {
      const { renderer, renderOnce, captureCharFrame } = await testRender(
        <PromptLine
          label="API key"
          input={insertText(emptyText(), 'sk-12')}
          placeholder=""
          masked
        />,
        { width: 40, height: 3 },
      )

      await renderOnce()

      expect(captureCharFrame()).toContain('API key: •••••')
      expect(captureCharFrame()).not.toContain('sk-12')
      act(() => renderer.destroy())
    })
  })

  it('when the panel field changes, TextPrompt shows the typed answer', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <TextPrompt step="repoDirectory" store={store} />,
      { width: 70, height: 3 },
    )

    act(() => store.directories.repoDirectory.insert('x'))
    await renderOnce()

    expect(captureCharFrame()).toContain(
      'What directory for the local repo crow setup: x',
    )
    act(() => renderer.destroy())
  })

  it('when a key is typed, TextPrompt types it into the panel field', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, mockInput } = await testRender(
      <TextPrompt step="repoDirectory" store={store} />,
      { width: 70, height: 3 },
    )

    await act(() => mockInput.typeText('x'))

    expect(store.directories.repoDirectory.text.peek().text).toBe('x')
    act(() => renderer.destroy())
  })

  it('when the field is empty, TextPrompt shows the default as the placeholder', async () => {
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

  it('when return arrives, TextPrompt moves to the panel that comes next', async () => {
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
