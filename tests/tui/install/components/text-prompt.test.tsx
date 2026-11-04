import { describe, expect, it } from 'bun:test'
import { TextAttributes } from '@opentui/core'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import {
  PromptLine,
  TextPrompt,
} from '../../../../src/tui/install/components/text-prompt.tsx'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { RepoPanel } from '../../../../src/tui/install/panels/repo.ts'
import { emptyText, insertText } from '../../../../src/tui/input-text.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('text-prompt', () => {
  describe('PromptLine', () => {
    it('when the input is empty, shows the label and the default', async () => {
      const { renderer, renderOnce, captureCharFrame } = await testRender(
        <PromptLine label="Where" input={emptyText()} defaultValue=".crow" />,
        { width: 40, height: 3 },
      )

      await renderOnce()

      expect(captureCharFrame()).toContain('Where: (.crow)')
      act(() => renderer.destroy())
    })

    it('when the default is bare, shows it without parentheses', async () => {
      const { renderer, renderOnce, captureCharFrame } = await testRender(
        <PromptLine label="Where" input={emptyText()} defaultValue="[]" bare />,
        { width: 40, height: 3 },
      )

      await renderOnce()

      expect(captureCharFrame()).toContain('Where: []')
      expect(captureCharFrame()).not.toContain('([])')
      act(() => renderer.destroy())
    })

    it('when the input has text, shows the text and hides the default', async () => {
      const { renderer, renderOnce, captureCharFrame } = await testRender(
        <PromptLine
          label="Where"
          input={insertText(emptyText(), './lib')}
          defaultValue=".crow"
        />,
        { width: 40, height: 3 },
      )

      await renderOnce()

      expect(captureCharFrame()).toContain('Where: ./lib')
      expect(captureCharFrame()).not.toContain('(.crow)')
      act(() => renderer.destroy())
    })

    it('when the cursor is inside the text, the character under it is inverse', async () => {
      const { renderer, renderOnce, captureSpans } = await testRender(
        <PromptLine
          label="Where"
          input={{ text: 'abc', cursor: 1 }}
          defaultValue=".crow"
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
          defaultValue=".crow"
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
          defaultValue=""
          bare
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
    const model = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <TextPrompt panel={new RepoPanel()} model={model} />,
      { width: 70, height: 3 },
    )

    act(() => model.directories.repoDirectory.insert('x'))
    await renderOnce()

    expect(captureCharFrame()).toContain(
      'What directory for the local repo crow setup: x',
    )
    act(() => renderer.destroy())
  })
})
