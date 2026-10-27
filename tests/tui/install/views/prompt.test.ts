import { describe, expect, it } from 'bun:test'
import { TextAttributes } from '@opentui/core'
import { createTestRenderer } from '@opentui/core/testing'
import { PromptView } from '../../../../src/tui/install/views/prompt.ts'
import { emptyText, insertText } from '../../../../src/tui/input-text.ts'

describe('PromptView', () => {
  it('when the input is empty, shows the label and the default', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 40, height: 3 },
    )
    const view = new PromptView(renderer)
    renderer.root.add(view.root())
    view.update({ label: 'Where', input: emptyText(), defaultValue: '.crow' })

    await renderOnce()

    expect(captureCharFrame()).toContain('Where: (.crow)')
    renderer.destroy()
  })

  it('when the default is bare, shows it without parentheses', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 40, height: 3 },
    )
    const view = new PromptView(renderer)
    renderer.root.add(view.root())
    view.update({
      label: 'Where',
      input: emptyText(),
      defaultValue: '[]',
      bare: true,
    })

    await renderOnce()

    expect(captureCharFrame()).toContain('Where: []')
    expect(captureCharFrame()).not.toContain('([])')
    renderer.destroy()
  })

  it('when the input has text, shows the text and hides the default', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 40, height: 3 },
    )
    const view = new PromptView(renderer)
    renderer.root.add(view.root())
    view.update({
      label: 'Where',
      input: insertText(emptyText(), './lib'),
      defaultValue: '.crow',
    })

    await renderOnce()

    expect(captureCharFrame()).toContain('Where: ./lib')
    expect(captureCharFrame()).not.toContain('(.crow)')
    renderer.destroy()
  })

  it('when masked, hides the typed characters', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 40, height: 3 },
    )
    const view = new PromptView(renderer)
    renderer.root.add(view.root())
    view.update({
      label: 'API key',
      input: insertText(emptyText(), 'sk-12'),
      defaultValue: '',
      bare: true,
      masked: true,
    })

    await renderOnce()

    expect(captureCharFrame()).toContain('API key: •••••')
    expect(captureCharFrame()).not.toContain('sk-12')
    renderer.destroy()
  })

  it('when the cursor is inside the text, the character under it is inverse', async () => {
    const { renderer, renderOnce, captureSpans } = await createTestRenderer({
      width: 20,
      height: 1,
    })
    const view = new PromptView(renderer)
    renderer.root.add(view.root())
    view.update({
      label: 'Where',
      input: { text: 'abc', cursor: 1 },
      defaultValue: '.crow',
    })

    await renderOnce()

    const { spans } = captureSpans().lines[0]
    expect(spans[1].text).toBe('b')
    expect(spans[1].attributes).toBe(TextAttributes.INVERSE)
    renderer.destroy()
  })

  it('when the cursor is at the end, shows an inverse blank after the text', async () => {
    const { renderer, renderOnce, captureSpans } = await createTestRenderer({
      width: 20,
      height: 1,
    })
    const view = new PromptView(renderer)
    renderer.root.add(view.root())
    view.update({
      label: 'Where',
      input: { text: 'ab', cursor: 2 },
      defaultValue: '.crow',
    })

    await renderOnce()

    const { spans } = captureSpans().lines[0]
    expect(spans[0].text).toBe(' Where: ab')
    expect(spans[1].text).toBe(' ')
    expect(spans[1].attributes).toBe(TextAttributes.INVERSE)
    renderer.destroy()
  })
})
